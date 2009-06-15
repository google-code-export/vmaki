require "libvirt"
require "xml/libxml"

class Pool < ActiveRecord::Base
  belongs_to :host
  has_many :volumes

	before_save :define_pool if APP_CONFIG["libvirt_integration"]
	before_destroy :undefine if APP_CONFIG["libvirt_integration"]

	def init
		@host = Host.find(self.host_id)
		connection = ConnectionsManager.instance
		connection_hash = connection.get(@host.name)
		@conn = connection_hash[:conn]
		
		@pool = get_pool if @pool.nil?

		if @pool.nil? || @pool.info.state == 0
			#the pool hasn't been initialized by Xen yet, so let's define it
			puts "initializing pool"
			@pool.create
			#return @pool
		end
  end

	# get all the details (name & path) about the specified pool
	def get_pool
		connection = ConnectionsManager.instance
		connection_hash = connection.get(@host.name)
		@conn = connection_hash[:conn]
    begin
      pool = @conn.lookup_storage_pool_by_name(self.name)
    rescue
      return nil
    end
		return pool
	end

	# updates the model with all the latest details
	def update_pool_info
		# make sure the pool is active and refresh its stats
		init
		@pool.refresh

		# save stats to pool object
		divide_to_gigabytes = (1024 * 1024 * 1024).to_f
		self.allocation = (@pool.info.allocation.to_f / divide_to_gigabytes).to_f
		self.available = (@pool.info.available.to_f / divide_to_gigabytes).to_f
		self.capacity = (@pool.info.capacity.to_f / divide_to_gigabytes).to_f
		self.state = @pool.info.state
		self.num_of_volumes = @pool.num_of_volumes
	end

	# defines a new pool, but doesn't create it. Has to be defined only once
	def define_pool
		@host = Host.find(self.host_id)
		connection = ConnectionsManager.instance
		connection_hash = connection.get(@host.name)
		@conn = connection_hash[:conn]
		pool_path = "/dev/#{self.name}"

		@pool = get_pool
		
		if @pool.nil?
			puts "Pool #{self.name} not defined yet, defining it now"
			@pool = @conn.define_storage_pool_xml(to_libvirt_xml(pool_path))
			init
			update_pool_info
		elsif @pool.info.state == 0
			puts "Pool #{self.name} not active, redefining it"
			@pool.undefine
			@pool.free
			@pool = @conn.define_storage_pool_xml(to_libvirt_xml(pool_path))
			init
		else
			puts "Pool #{self.name} has already been defined"
			update_pool_info
		end
	end

	private

	def to_libvirt_xml(pool_path)
		# create a new XML document
		doc = XML::Document.new()
		# create the root element
		doc.root = XML::Node.new("pool")
		root = doc.root
		# define those attributes
		root["type"] = Constants::LVM

		# create name element
		root << name = XML::Node.new("name")
		name << self.name

		# create target parent element
		root << target = XML::Node.new("target")

		# create path element
		target << path = XML::Node.new("path")
		path << pool_path

		return doc.to_s
	end

	# undefines a previously defined pool and frees its reference object
	def undefine
		@pool.undefine
		@pool.free
	end
end
