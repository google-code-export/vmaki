require "constants"

class VncPort < ActiveRecord::Base

	before_update :check_port_value

	def get_port(vmname, hostname)
		# first, check if there isn't already a port assigned to the vmname & hostname combination
		port_already_exists = VncPort.find(:first, :conditions => [ "vmname = '#{vmname}'", "hostname = '#{hostname}'" ])
		if port_already_exists.nil?
			# no existing port for this VM has been found. search for the smallest available port for provided hostname
			vncport = find_lowest(hostname)
			if vncport.nil?
				# no vnc port available, let's add a new one!
				puts "no vnc port available"
				new_port = add(vmname, hostname)
				return new_port
			else
				# a free vnc port for the host was found, let's use that one
				puts "free vnc port found"
				vncport.update_attribute(:vmname, vmname)
				return vncport.port
			end
		else
			return port_already_exists.port
		end

	end

	#	private

	# find the lowest available port
	def find_lowest(hostname)
		#lowest_free_id = VncPort.find_id_by_sql "SELECT min(id) FROM vnc_ports WHERE vmname = '' AND hostname = '#{hostname}' "
		lowest_free_port = VncPort.find(:first, :conditions => [ "vmname = ''", "hostname = #{hostname}" ], :order => "port ASC")
		return lowest_free_port
	end

	# adds a new port
	def add(vmname, hostname)
		highest_occupied_port = VncPort.find(:first, :conditions => [ "vmname <> '' AND hostname = '#{hostname}'" ], :order => "port DESC")
		puts highest_occupied_port.id if !highest_occupied_port.nil?
		
		port_number = 0

		if highest_occupied_port.nil?
			# no port record has been created for this vm & host combination yet, so create an entirely new one using VNC Base Port 5900
			port_number = Constants::VNC_BASE_PORT
		else
			# an existing record for this host has been found, let's create a new one with port + 1
			port_number = highest_occupied_port.port + 1
		end
		
		successful = self.update_attributes(:port => port_number, :vmname => vmname, :hostname => hostname)
		if successful == false
			puts "Error: new port could not be created!"
			return nil
		else
			puts "new port created"
			return self.port
		end

	end

	# removes the VM reference from an existing port record
	def set_port_free(vmname, hostname)
		my_port = VncPort.find(:first, :conditions => {:vmname => vmname, :hostname => hostname})
		my_port.update_attribute(:vmname, "")
	end

	def check_port_value
		if self.port_changed?
			if self.port > 5900 && self.port <= 6000
				return true
			else
				puts "Error: port value should be between 5900 and 6000"
				return false
			end
		end
	end
end
