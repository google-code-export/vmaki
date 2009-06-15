require 'rubygems'
require 'net/ssh'
require "constants"
require "libvirt"

class Volume
	attr_accessor :pool, :poolname, :volname, :source_path, :target_path, :capacity

  def initialize(conn)
    @conn = conn
  end

	# create the volume
	def create(poolname, volname, source_hd, capacity, type=nil)
		@poolname = poolname
		@volname = volname
		@source_path = "/dev/#{source_hd}"
		@target_path = "/dev/#{@poolname}/#{@volname}"
		@capacity = capacity.to_f  * 1024 * 1024 * 1024

		# get a reference to a storage pool object
		@pool = @conn.lookup_storage_pool_by_name(@poolname)
		# create the volume within the system (persistent)
		@pool.create_vol_xml(to_xml)

		# as a last step, a filesystem has to be created (either ext3 or swap)
		
		if type.nil? or type == "root"
			puts "Creating a root filesystem on #{@target_path}"
			Net::SSH.start('localhost', 'root', :password => "toor") do |ssh|
				return ssh.exec!("mkfs -t ext3 #{@target_path}")
			end
		end
		if type == "swap"
			puts "Creating a swap filesystem on #{@target_path}"
			Net::SSH.start('localhost', 'root', :password => "toor") do |ssh|
				return ssh.exec!("mkswap #{@target_path}")
			end
		end
	end


	def delete(poolname, volname)
		pool = @conn.lookup_storage_pool_by_name(poolname)
		volume = pool.lookup_volume_by_name(volname)
		volume.delete
	end

	private
	def to_xml
		#require "libvirt"
		require "xml/libxml"

		# create a new XML document
		doc = XML::Document.new()
		# create the root element
		doc.root = XML::Node.new("volume")
		root = doc.root
		root["type"] = Constants::LVM

		# create name element
		root << name = XML::Node.new("name")
		name << @volname

		# create source parent element
		root << source = XML::Node.new("source")

			# create device element
			source << device = XML::Node.new("device")
			device["path"] = @source_path

		# create capacity element
		root << capacity = XML::Node.new("capacity")
		capacity << @capacity

		# create target parent element
		root << target = XML::Node.new("target")

			# create path element
			target << path = XML::Node.new("path")
			path << @target_path

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
end
