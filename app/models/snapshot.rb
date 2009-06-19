require "constants"

class Snapshot < ActiveRecord::Base
	validates_uniqueness_of :name

	belongs_to :vm

	before_create :manage_create
	before_update :manage_update
  before_destroy :manage_delete

	def manage_create
		vm = Vm.find_by_id(self.vm_id)
		snapshots = Snapshot.find(:all, :conditions => {:vm_id => self.vm_id} )
		snapshot_nr = snapshots.size + 1
		self.name = "#{vm.name}-snapshot-#{snapshot_nr}"
    self.display_date = Time.now.localtime.strftime("%Y-%m-%d %H:%M")

		volume = Volume.find_by_id(vm.rootvolume_id)
		pool = Pool.find_by_id(volume.pool_id)
		
		host = Host.find_by_id(vm.host_id)

    threads = []
    snapshot_name = self.name
    snapshot_filename = "#{Constants::SNAPSHOTS_PATH}/#{self.name}.img"
    pool_name = pool.name
    volume_name = volume.name

    Dblogger.log("Production", "system", "Snapshot", "Creating Snapshot: #{snapshot_name}")

    threads << Thread.new("snapshotting-thread") do |thread|
      self.status = "creating"
      # establish an SSH connection
      Net::SSH.start(host.name, host.username, :auth_methods => "publickey", :timeout => Constants::SSH_Timeout) do |ssh|
        # make sure the snapshot folder exists
        puts "creating snapshot folder"
        puts ssh.exec!("mkdir -p #{Constants::SNAPSHOTS_PATH}")
        
        # create the LVM snapshot
        puts "creating snapshot: lvcreate -L #{Constants::LVM_SNAPSHOT_SIZE} -s -n #{snapshot_name} #{pool_name}/#{volume_name}"
        puts ssh.exec!("lvcreate -L #{Constants::LVM_SNAPSHOT_SIZE} -s -n #{snapshot_name} #{pool_name}/#{volume_name}")
        puts "copying snapshot to file: dd if=/dev/#{pool_name}/#{snapshot_name} of=#{snapshot_filename}"
        puts ssh.exec!("dd if=/dev/#{pool_name}/#{snapshot_name} of=#{snapshot_filename}")
        puts "deleting snapshot volume"
        puts ssh.exec!("sync")
        puts ssh.exec!("lvremove -f #{pool_name}/#{snapshot_name}")

        # retrieve filesize of the created .img file
        results = ssh.exec!("ls -sh #{snapshot_filename}").split(" ")
        filesize = results[0]
        filesize = filesize.gsub(/[MG]/,'').to_f
        puts "filesize: #{filesize}"

        # update snapshot with status & filesize
        ActiveRecord::Base.connection.execute("UPDATE snapshots SET size=#{filesize}, status = 'ready' WHERE name = '#{snapshot_name}';")
        # create log message
        ActiveRecord::Base.connection.execute("INSERT INTO log (user, subject, text) VALUES ('system', 'Snapshot', 'Creation of Snapshot #{snapshot_name} completed')")
      end

    end
	end

	def manage_update
		if self.changed? && (self.status != "creating" || self.status != "restoring")

		end
	end

  def manage_delete
    snapshot_filename = "#{Constants::SNAPSHOTS_PATH}/#{self.name}.img"
    vm = Vm.find_by_id(self.vm_id)
    host = Host.find_by_id(vm.host_id)

    threads = []

    threads << Thread.new("delete-snapshot-thread") do |thread|
      Net::SSH.start(host.name, host.username, :auth_methods => "publickey", :timeout => Constants::SSH_Timeout) do |ssh|
        ssh.exec!("rm #{snapshot_filename}")
      end
    end
  end
end
