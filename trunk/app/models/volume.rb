require 'net/ssh'
require "libvirt"
require "xml/libxml"

class Volume < ActiveRecord::Base
	validates_uniqueness_of :name

  belongs_to :pool
	has_one :vm

	#before_update :do_update if APP_CONFIG["libvirt_integration"]
	before_save :do_save
	before_update :do_update
	before_destroy :remove if APP_CONFIG["libvirt_integration"]

	def do_save
		# if the model already exists, go to do_update
		if self.new_record? && APP_CONFIG["libvirt_integration"]
			puts "Creating volume"

			@pool = Pool.find(self.pool_id)
			self.target_path = "#{@pool.name}/#{self.name}"

			# initialize libvirt part of the volume, but only if libvirt integration is enabled!
			libvirt_init if APP_CONFIG["libvirt_integration"]

			# update volume stats
			update_volume_info
		else
			puts "Updating volume"
			do_update
		end
	end

	def do_update
		puts "Updating volume"
		@pool = Pool.find(self.pool_id)
		@host = Host.find(@pool.host_id)
		self.target_path = "#{@pool.name}/#{self.name}"

		connection = ConnectionsManager.instance
		connection_hash = connection.get(@host.name)
		@conn = connection_hash[:conn]

		# get a reference to the storage pool object
		@pool_ref = @conn.lookup_storage_pool_by_name(@pool.name)

		new_size_in_mb = (self.capacity * 1024).to_i
		puts "New Size: #{new_size_in_mb}"
		puts "Target Path: /dev/#{self.target_path}"
		Net::SSH.start(@host.name, @host.username, :auth_methods => "publickey", :timeout => 2) do |ssh|

			# check if volume contains a root filesystem and if yes, resize that as well
			if self.mkfs
				if self.vol_type == "root"
					# TODO: Check if filesystem is mounted!

					# check if volume is being grown or shrunk
					if self.capacity > self.capacity_was
						# grow
						puts "growing volume"
						ssh.exec!("lvresize -L#{new_size_in_mb}M -n -f #{self.target_path}")
						@pool_ref.refresh
						sleep 2
						puts "growing filesystem"
						return ssh.exec!("resize2fs -f /dev/#{self.target_path} #{new_size_in_mb}M")
					elsif self.capacity < self.capacity_was
						# shrink
						puts "shrinking filesystem"
						ssh.exec!("resize2fs -f /dev/#{self.target_path} #{new_size_in_mb}M")
						sleep 2
						puts "shrinking volume"
						ssh.exec!("lvresize -L#{new_size_in_mb}M -n -f #{self.target_path}")
						@pool_ref.refresh
					end
				end
			else
				# resize LVM Volume
				return ssh.exec!("lvresize -L#{new_size_in_mb}M -n -f #{self.target_path}")
			end

		end

		# update volume stats
		update_volume_info
		
	end

	# create the volume
	def libvirt_init
		#@pool = Pool.find(self.pool_id)
		@host = Host.find(@pool.host_id)

		target_path = "/dev/#{self.target_path}"
		capacity = self.capacity.to_f * 1024 * 1024 * 1024

		connection = ConnectionsManager.instance
		connection_hash = connection.get(@host.name)
		@conn = connection_hash[:conn]

		# check if the pool has to be initialized first and if so, initialize it
		@pool.define_pool
		# get a reference to the storage pool object
		@pool_ref = @conn.lookup_storage_pool_by_name(@pool.name)

		# check if the volume already exists and remove it if needed
		remove

		# create the volume within the system (persistent)
		@pool_ref.create_vol_xml(to_libvirt_xml(target_path, capacity))

		# check if a filesystem has to be created (only for PV guests necessary)
		if self.mkfs
			# now check which filesystem has to be created (either ext3 or swap)
			if self.vol_type == "root"
				puts "Creating a root filesystem on #{target_path}"
				Net::SSH.start(@host.name, @host.username, :auth_methods => "publickey", :timeout => 2) do |ssh|
					return ssh.exec!("mkfs -t ext3 #{target_path}")
				end
			end
			if self.vol_type == "swap"
				puts "Creating a swap filesystem on #{target_path}"
				Net::SSH.start(@host.name, @host.username, :auth_methods => "publickey", :timeout => 2) do |ssh|
					return ssh.exec!("mkswap #{target_path}")
				end
			end
		end
	end

	private

	def remove
		@pool = Pool.find(self.pool_id)
		@host = Host.find(@pool.host_id)

		connection = ConnectionsManager.instance
		connection_hash = connection.get(@host.name)
		@conn = connection_hash[:conn]

		# check if the pool has to be initialized first and if so, initialize it
		@pool.define_pool
		# get a reference to a storage pool object
		@pool_ref = @conn.lookup_storage_pool_by_name(@pool.name)

		# delete the volume first (because it still might exist within the xen context)
		@pool_ref.refresh
		volumes = @pool_ref.list_volumes

		if volumes.include?(self.name)
			volume = @pool_ref.lookup_volume_by_name(self.name)
			puts "need to delete volume first"
			volume.delete
		end
	end

	def to_libvirt_xml(target_path, vol_capacity)
		# create a new XML document
		doc = XML::Document.new()
		# create the root element
		doc.root = XML::Node.new("volume")
		root = doc.root
		root["type"] = Constants::LVM

		# create name element
		root << name = XML::Node.new("name")
		name << self.name

		# create capacity element
		root << capacity = XML::Node.new("capacity")
		capacity << vol_capacity

		# create target parent element
		root << target = XML::Node.new("target")

		# create path element
		target << path = XML::Node.new("path")
		path << target_path

		# create permissions parent element
		target << permissions = XML::Node.new("permissions")

		# create mode element
		permissions << mode = XML::Node.new("mode")
		mode << Constants::PERMISSIONS_MODE

		# create owner element
		permissions << owner = XML::Node.new("owner")
		owner << Constants::PERMISSIONS_OWNER

		# create group element
		permissions << group = XML::Node.new("group")
		group << Constants::PERMISSIONS_GROUP

		return doc.to_s
	end

	# updates the model with all the latest details
	def update_volume_info
		#		@pool = Pool.find(self.pool_id)
		#		@host = Host.find(@pool.host_id)
		#
		#		connection = ConnectionsManager.instance
		#		connection_hash = connection.get(@host.name)
		#		conn = connection_hash[:conn]

		# get pool reference in order to get a reference to the volume
		@pool = @conn.lookup_storage_pool_by_name(@pool.name)
		volume = @pool.lookup_volume_by_name(self.name)
		volume_info = volume.info
		
		# add some stats to pool object
		divide_to_gigabytes = (1024 * 1024 * 1024).to_f
		self.allocation = (volume_info.allocation.to_f / divide_to_gigabytes).to_f
	end

	
end
