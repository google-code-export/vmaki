require "libvirt"
require 'host'
require 'singleton'
require 'ssh_key'

class ConnectionsManager
	include Singleton

	def initialize
		@connections = Hash.new
	end
	
	def add(host)
		# try to connect via SSH
		password_less_connection = SshKey.new(host.name, host.username, host.password)
		if password_less_connection
			connection_string = "#{host.connection_type}#{host.username}@#{host.name}"
			puts "connecting to: #{connection_string}"
			# put SSH Connection stuff here!
			conn = Libvirt::open(connection_string)
			Dblogger.log("Debug", "system", "Host", conn.capabilities)
						
			@connections[host.name] = { :host => host.clone, :conn => conn}
		end
	end

  def remove(name)
		# doesn't work yet!
		#@connections[name][conn].disconnect
		@connections[name] = nil
	end

	def get(name)
		return @connections[name]
	end
end
