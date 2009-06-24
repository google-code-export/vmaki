require 'net/ssh'
require 'net/sftp'
require 'constants'

class SshKey
	def connect(type, hostname, username, password=nil)
		begin
			if type == "key"
				session = Net::SSH.start(hostname, username, :auth_methods => "publickey", :timeout => Constants::SSH_Timeout)
			elsif type == "password"
				session = Net::SSH.start(hostname, username, :password => password, :timeout => Constants::SSH_Timeout)
			end

			# if we get till here, it means the connection has been successfully established!
			return true
		rescue
			puts "connection could not be established"
			return false
		end
	end

	def add_key(hostname, username, password, public_key, home_path, key_path)
		puts "public_key: #{public_key}"
    puts "home_path: #{home_path}"
    puts "key_path: #{key_path}"
    Net::SFTP.start(hostname, username, :password => password) do |sftp|
			# create path to the authorized_keys file
			public_key_data = String.new
      puts "opening public_key"
			File.open("#{public_key}/id_rsa.pub") do |f|
				public_key_data += f.gets
			end

			puts "checking existence of .ssh folder"
			# check if .ssh folder exists and if not, create it
			folder_to_look_for = ".ssh"
			folder_found = false

			sftp.dir.foreach(home_path) do |entry|
        if entry.name == folder_to_look_for
					if sftp.lstat!(key_path).directory?
						# found .ssh folder
						puts "#{folder_to_look_for} found"
						folder_found = true
					else
						# found .ssh folder but does not seem to be a directory, raise an error!
						raise "#{folder_to_look_for} is not a directory"
					end
        end
			end

			if !folder_found
        # .ssh folder was not found, so let's create it
				puts ".ssh folder not found, creating it"
        sftp.mkdir!(key_path, :permissions => 16877)
			end


			existing_data = String.new
      puts "opening authorized_keys"
			sftp.file.open("#{key_path}/authorized_keys", "a+") do |f|
				if !f.eof?
          existing_data = f.gets
				end
			end
			puts "Existing Data: #{existing_data}" if !existing_data.nil?

			sftp.file.open("#{key_path}/authorized_keys", IO::WRONLY|IO::CREAT) do |file|
				file.puts existing_data if !existing_data.nil?
				file.puts public_key_data
			end
		end
	end

	def try_different_connection_methods(hostname, username, password, public_key, home_path, key_path)
    if FileTest.exists?("#{public_key}/id_rsa.pub")
      # a public key has been found, now try to connect to the host without a password
      puts "trying key-based connection"
      if !connect("key", hostname, username)
        # logging in w/o a password didn't work, check if it's possible to login with password
        puts "trying password-based connection"
        if !connect("password", hostname, username, password)
          # also couldn't login with a password! exit!
          puts "could not connect to remote host"
          exit!
        end
        # password-based connection worked, now try to add the public key to the remote host
        puts "connected with password, adding key"
        add_key(hostname, username, password, public_key, home_path, key_path)
      end
      puts "connected with key"
			return true
    else
			if connect("password", hostname, username, password)
				system("ssh-keygen -t rsa -f #{public_key}/id_rsa -q -N '' ")
				try_different_connection_methods(hostname, username, password, public_key, home_path, key_path)
			else
				puts "password-based connection could not be established! Wrong credentials?"
			end
    end
	end

	def initialize(hostname, username, password)

		# retrieve user under which the managed node is running
		local_user = `whoami`

		# set path to local public key
		if local_user.strip == "root"
			public_key = "/root/.ssh"
		else
			public_key = "/home/#{local_user.chomp}/.ssh"
		end

		# set path to remote ssh-keys folder and to 
		if username == "root"
			home_path = "/root"
			key_path = "/root/.ssh"		
		else
			home_path = "/home/#{username}"
			key_path = "/home/#{username}/.ssh"
		end



		# now try different connection types
		return try_different_connection_methods(hostname, username, password, public_key, home_path, key_path)
	end
end
