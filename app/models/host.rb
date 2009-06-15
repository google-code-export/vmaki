require 'net/ssh'
require "libvirt"
require 'xml'
require 'constants'

class Host < ActiveRecord::Base
	attr_accessor :current_user
	validates_uniqueness_of :name

  has_many :pools
	has_many :vms
	has_many :nics

	before_save :manage_connection if APP_CONFIG["libvirt_integration"]
	after_save :retrieve_nics if APP_CONFIG["libvirt_integration"]
	before_destroy :delete_nics if APP_CONFIG["libvirt_integration"]
	
	def manage_connection
		if self.connect == true
			# connect host
			establish_libvirt_connection
		elsif self.connect == false
			# disconnect host
			self.connected = false
			return self
		end
	end

	def establish_libvirt_connection
		if self.connect == true # && self.connected == false
			
			if connection_already_exists
				self.connected = true
				# get all the latest details for this host
				update_host_info
					
			elsif !connection_already_exists
				connection = ConnectionsManager.instance
				connection.add(self)

				# during inititialization, set current user to "Startup Service"
				self.current_user = "Startup Service" if self.current_user.nil?

				# if connection was established successfully, set connected = true
				if connection_already_exists
					self.connected = true

					# get all the latest details for this host
					update_host_info

					# write success message to log table
					Dblogger.log("Production", self.current_user, "Host", "Connected Host #{self.name} with id:#{self.id}")
				else
					self.connected = false
					Dblogger.log("Production", self.current_user, "Host", "Connection to Host #{self.name} with id:#{self.id} could not be established!")
				end
			end
		end
	end

	def connection_already_exists
		connection = ConnectionsManager.instance
		# check if a connection for the specified host already exists
		connection_hash = connection.get(self.name)
		# return true if a reference to the connection object already exists
		if connection_hash.nil?
			return false
		else
			return true
		end
	end

	# updates the model with all the latest details
	def update_host_info
		# get previously added connection & and instantiate a node info object
		connection = ConnectionsManager.instance
		connection_hash = connection.get(self.name)
		conn = connection_hash[:conn]

		node_info = conn.node_get_info
		# add some stats to host object
		self.cpus = node_info.cpus
		self.cores = node_info.cores
		self.total_memory = node_info.memory
		self.mhz = node_info.mhz
		self.model = node_info.model
		self.nodes = node_info.nodes
		self.sockets = node_info.sockets
		self.threads = node_info.threads

		# get memory info from dom0
		domain = conn.lookup_domain_by_id(0)
		self.memory = domain.info.memory

		# get hvm_support info from host capabilities
		xml_string = conn.capabilities.to_s
		doc = XML::Document.string(xml_string)

		# extract hvm support info via xpath
		nodes_array = doc.find(Constants::OS_TYPE_XPATH).to_a
		nodes_string = nodes_array.to_s
		self.hvm_support = nodes_string.include?("hvm")
	end

	# updates the model with only Dom0 Memory info
	def update_mem_info
		# get previously added connection & and instantiate a node info object
		connection = ConnectionsManager.instance
		connection_hash = connection.get(self.name)
		conn = connection_hash[:conn]

		# get memory info from dom0
		domain = conn.lookup_domain_by_id(0)
		self.memory = domain.info.memory
	end

	def retrieve_nics
		Nic.retrieve(self.id)
	end

	def delete_nics
		# before this host is being removed, make sure all associated nics are removed as well
		Nic.destroy_all(:host_id => self.id)
	end

end
