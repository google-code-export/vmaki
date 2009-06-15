require "rubygems"
require "libvirt"
require "xml/libxml"
require "constants"

class Pool
	attr_reader	:pool, :conn, :name, :path

	def initialize(conn, name)
			@conn = conn
			get_pool(name)
			if @pool.info.state == 0
				#the pool hasn't been initialized by Xen yet, so let's define it
				puts "initializing pool"
				@pool.create
			end
			puts "pool already initialized"
			return @pool
  end

	# defines a new pool, but doesn't create it. Has to be defined only once
	def define(name)
		@name = name
		@path = "/dev/#{@name}"
		@pool = @conn.define_storage_pool_xml(to_xml)
	end

	# undefines a previously defined pool
	def undefine(name)
		get_pool(name)
		@pool.undefine
	end

	# discover all available LVM storage pools on the system
	def discover_pools
		return @conn.discover_storage_pool_sources(Constants::LVM)
	end

	# list all self-defined pools
	def list_pools
		return @conn.list_defined_storage_pools
	end

	#list all volumes that exist within the pool
	def list_volumes
		return @pool.list_volumes
	end

	#get all the details (name & path) about the specified pool
	def get_pool(name)
		@pool = @conn.lookup_storage_pool_by_name(name)
		@name = name
		@path = "/dev/#{@name}"
	end

	private
	def to_xml
		# create a new XML document
		doc = XML::Document.new()
		# create the root element
		doc.root = XML::Node.new("pool")
		root = doc.root
		# define those attributes
		root["type"] = Constants::LVM

		# create name element
		root << name = XML::Node.new("name")
		name << @name

		# create target parent element
		root << target = XML::Node.new("target")

			# create path element
			target << path = XML::Node.new("path")
			path << @path

		return doc.to_s
	end

end
