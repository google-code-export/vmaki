require "constants"

class Snapshot < ActiveRecord::Base
	validates_uniqueness_of :name

	belongs_to :vm

	before_create :manage_create

	before_update :manage_update

	def manage_create
		vm = Vm.find_by_id(self.vm_id)
		snapshots = Snapshot.find(:all, :conditions => {:vm_id => self.vm_id} )
		snapshot_nr = snapshots.size + 1
		self.name = "#{vm.name}-snapshot-#{snapshot_nr}"

		volume = Volume.find_by_id(vm.rootvolume_id)
		pool = Pool.find_by_id(volume.pool_id)
		
		# establish an SSH connection
		host = Host.find_by_id(vm.host_id)
		Net::SSH.start(host.name, host.username, :auth_methods => "publickey", :timeout => Constants::SSH_Timeout) do |ssh|
			snapshot_filename = "#{Constants::SNAPSHOTS_PATH}/#{self.name}.img"
			# first make sure the snapshot folder exists
			puts "creating snapshot folder"
			puts ssh.exec!("mkdir -p #{snapshot_filename}")
			# create the LVM snapshot
			puts "creating snapshot"
			puts ssh.exec!("lvcreate -L #{Constants::LVM_SNAPSHOT_SIZE} -s -n #{self.name} #{pool.id}/#{volume.name}")
			puts "copying snapshot"
			puts ssh.exec!("dd if=#{pool.id}/#{self.name} of=#{snapshot_filename}")
			
			# retrieve filesize of the created .img file
			results = ssh.exec!("ls -sh #{snapshot_filename}").split(" ")
			filesize = results[0]
			self.size = filesize
		end
	end

	def manage_update
		if self.changed? && (self.status != "creating" || self.status != "restoring")

		end
	end
end
