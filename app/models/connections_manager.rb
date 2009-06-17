require "libvirt"
require 'host'
require 'singleton'
require 'net/ssh'
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
			conn = Libvirt::open(connection_string)

      # mount NFS share
      mount_nfs(host)

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

  def mount_nfs(host)
    Net::SSH.start(host.name, host.username, :auth_methods => "publickey", :timeout => 2) do |ssh|
      puts "Unmounting existing NFS Share"
      puts ssh.exec!("umount /mnt/tmp")
      puts "Mounting NFS Share from Management Node"
      puts ssh.exec!("mount #{local_ip}:/isos /mnt/tmp")
    end
  end

  def local_ip
		# turn off reverse DNS resolution temporarily
		orig, Socket.do_not_reverse_lookup = Socket.do_not_reverse_lookup, true

		UDPSocket.open do |s|
			# One of Google's IPs. It is NOT being used in any way though, since no real connection is opened
			s.connect '64.233.187.99', 1
			s.addr.last
		end
	ensure
		Socket.do_not_reverse_lookup = orig
	end
end
