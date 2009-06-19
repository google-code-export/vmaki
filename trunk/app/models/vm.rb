require "libvirt"
require "xml/libxml"
require 'net/http'
require 'net/ssh'
require "constants"
require "provisioning"

class Vm < ActiveRecord::Base
	has_many :snapshots

	attr_accessor :current_user
	validates_uniqueness_of :name
	
	belongs_to :host
	belongs_to :root, :class_name => "Volume", :foreign_key => "rootvolume_id"
	belongs_to :nic

	before_create :define_vm if APP_CONFIG["libvirt_integration"]
	before_update :manage_libvirt_update if APP_CONFIG["libvirt_integration"]
	before_destroy :manage_delete if APP_CONFIG["libvirt_integration"]

	def refresh_libvirt_status
		# if status is 'provisioning', then do not refresh the libvirt state,
		# but return true so the current one will be returned.
		return true if self.status == "provisioning" || self.status == "restoring"

		@host = Host.find(self.host_id)
		return false if !@host.connection_already_exists

		connection = ConnectionsManager.instance
		connection_hash = connection.get(@host.name)
		conn = connection_hash[:conn]

		begin
			# get a reference to the domain object
			@domain = conn.lookup_domain_by_uuid(self.uuid)
			info = @domain.info

			# To take a look at the current XML description of the VM, uncomment the following line:
			# Dblogger.log("Debug", "system", "VM", @domain.xml_desc)
			mapped_status = map_status(info.state)

			self.status = mapped_status
			self.save
			@domain.free
		rescue
			puts "Fatal Error: VM with name #{self.name} and ID #{self.id} was not found within Xen context"
			Dblogger.log("Production", "system", "VM", "Fatal Error: VM with name #{self.name} and ID #{self.id} was not found within Xen context")
		end
		return true
	end


	private

	def manage_libvirt_update
		# set up target_device & target_bus for PV & HVM guests
		self.ostype == "linux" ? @target_device = "xvda" :  @target_device = "hdc"
		self.ostype == "linux" ? @target_bus = "xen" :  @target_bus = "ide"

		# check if the model has been changed
		if self.changed? && self.status != "provisioning"
			@host = Host.find(self.host_id)
			connection = ConnectionsManager.instance
			connection_hash = connection.get(@host.name)
			@conn = connection_hash[:conn]

			# get a reference to the domain
			@domain = @conn.lookup_domain_by_uuid(self.uuid)
			@info = @domain.info

			puts "VM State: #{@info.state}"

			# update memory if attribute has changed
			if self.memory_changed?
				puts "CHANGING MEMORY"

				# check if VM is HVM-based and make sure, it's not running
				if self.ostype == Constants::HVM_TYPE
					if self.status == Constants::VM_LIBVIRT_RUNNING
						raise "can't change memory on a running HVM guest"
					else
						puts "Changing memory on a hvm based guest"
						if self.memory < (@domain.max_memory / 1024)
							@domain.memory = self.memory * 1024
							@domain.max_memory = self.memory * 1024
						else
							@domain.max_memory = self.memory * 1024
							@domain.memory = self.memory * 1024
						end
					end

				else
					# guest is PV-based
          if self.ostype == Constants::VM_LIBVIRT_SHUTOFF
            puts "Changing Memory for shutoff PV guest"
            if self.memory < (@domain.max_memory / 1024)
              @domain.memory = self.memory * 1024
							@domain.max_memory = self.max_memory * 1024
            else
              @domain.max_memory = self.max_memory * 1024
							@domain.memory = self.memory * 1024
            end
          else
            puts "Changing Memory for PV guest"
            puts "Max-Memory: #{@domain.max_memory / 1024}"
            @domain.max_memory = self.max_memory * 1024
            sleep 2
            puts "Max-Memory: #{@domain.max_memory / 1024}"
            #if self.memory <= (@domain.info.max_memory / 1024)
            @domain.memory = self.memory * 1024
            #else
						#raise "can't change memory on PV guest, max_memory not big enough!"
            #end

          end
				end
				
				# get the VNC Port already assigned to the VM and redefine the vm
				vnc_port = get_vnc_port(@host)

				# get kernel files
				get_kernel_files

				@conn.define_domain_xml(to_libvirt_xml(vnc_port))
			end

			# update VCPU if it has changed
			if self.vcpu_changed?
				@domain.vcpus = self.vcpu

				vcpu_check_counter = 0
				until (@domain.info.nr_virt_cpu == self.vcpu) || (vcpu_check_counter == 5)
					vcpu_check_counter = vcpu_check_counter + 1
					sleep 1
				end
				raise "Could not set VCPUs" if vcpu_check_counter == 5
			end

			# get lowercase representation of the boot_device attribute
			boot_device_lowercase = self.boot_device.downcase if !self.boot_device.nil?
			if self.boot_device_changed? && self.ostype == "hvm" && (boot_device_lowercase == "cdrom" || boot_device_lowercase == "hd" || boot_device_lowercase == "network")
				# get the VNC Port already assigned to the VM and redefine the vm		
				vnc_port = get_vnc_port(@host)

				# get kernel files
				get_kernel_files

				@conn.define_domain_xml(to_libvirt_xml(vnc_port))
      elsif self.boot_device_changed?
				self.boot_device = nil
			end

			# check if an action has to be completed
			if self.action_changed?
				puts "new Action: #{self.action}"
				# explanation of actions and their correspong statuses
				#			(action)				  (status)		(libvirt command)
				#		- start				=>		running				=>	create
				#		- shutdown		=>		shutdown			=>	shutdown
				#		- reboot			=>		running				=>	reboot
				#		- suspend			=>		suspended			=>	suspend
				#		- resume			=>		running				=>	resume
				#		- kill				=>		shutdown			=>	destroy
				if self.action == "start"
					puts "Starting Domain: #{@domain.name}"
					@domain.create
					info = @domain.info
					self.status = info.state
				end

				if self.action == "shutdown"
					puts "Shutting down Domain: #{@domain.name}"
					@domain.shutdown
					xml_define_vm(@host, @conn)
					info = @domain.info
					self.status = info.state
				end

				if self.action == "reboot"
					# in order to be able to redefine the domain (to make Media changes during run-time permanent)
					# the domain has to be shutdown, redefined and then created
					puts "Rebooting Domain: #{@domain.name}"
					@domain.shutdown
					xml_define_vm(@host, @conn)
					@domain.create
					info = @domain.info
					self.status = info.state
				end
				if self.action == "suspend"
					puts "Suspending Domain: #{@domain.name}"
					@domain.suspend
					info = @domain.info
					self.status = info.state
				end
				if self.action == "resume"
					puts "Resuming Domain: #{@domain.name}"
					@domain.resume
					info = @domain.info
					self.status = info.state
				end
				if self.action == "kill"
					puts "Destroying Domain: #{@domain.name}"
					@domain.destroy
					xml_define_vm(@host, @conn)
					info = @domain.info
					self.status = info.state
				end

				# update status
				info = @domain.info
				self.status = map_status(info.state)
			end

			# check if the cdrom attribute has been changed and if yes, redefine the domain
			if self.cdrom_changed? || self.iso_id_changed?
				puts "changing CDROM"
				# check the status of the VM
				if self.status == Constants::VM_LIBVIRT_SHUTOFF
					puts "Redefining VM for CDROM change"
					# the VM has been shut off, redefine the VM the physical or file-based drive
					if ((self.cdrom.downcase == "phy") || (self.cdrom.downcase == "iso" && !self.iso_id.nil?))
						xml_define_vm(@host, @conn)
					end
				elsif (!(self.status == Constants::VM_LIBVIRT_SHUTOFF) && (self.ostype == Constants::HVM_TYPE))
					# if the VM has not been shut off, detach & attach the physical or file-based drive
					if (self.cdrom.downcase == "phy")
						puts "Switching from ISO to PHY"

						detach_xml = "<disk type='file' device='cdrom'>
													<target dev='#{@target_device}' />
												</disk>"

						attach_xml = "<disk type='block' device='cdrom'>
													<driver name='phy'/>
													<source dev='/dev/scd0'/>
													<target dev='#{@target_device}' bus='#{@target_bus}'/>
													<readonly/>
												</disk>"

						puts detach_xml
						puts attach_xml
						@domain.detach_device(detach_xml)
						@domain.attach_device(attach_xml)

					elsif (self.cdrom.downcase == "iso" && !self.iso_id.nil?)
						puts "Switching from PHY to ISO"
						iso = Iso.find(self.iso_id)
						if !iso.nil?
						
							# first detach the physical cdrom drive from the guest
							detach_xml = "<disk type='block' device='cdrom'>
													<target dev='#{@target_device}' />
												</disk>"

							attach_xml = "<disk type='file' device='cdrom'>
													<driver name='file'/>
													<source file='#{Constants::NFS_MOUNT_PATH}/#{iso.filename}'/>
													<target dev='#{@target_device}' bus='#{@target_bus}'/>
												</disk>"

							puts detach_xml
							puts attach_xml
							@domain.detach_device(detach_xml)
							@domain.attach_device(attach_xml)
						end
					end
				end
			

			end
			
			# get the VNC Port already assigned to the VM and redefine the vm
			#			vnc_port = get_vnc_port(@host)
			#			conn.define_domain_xml(to_libvirt_xml(vnc_port.port))

			# free the reference to the domain object
			@domain.free
		end

		# set action back to nil, so it acts like a flag.
		# useful when the same action should be executed multiple times (like rebooting)
		self.action = nil
	end

	def provision(modules)
		volume = Volume.find(self.rootvolume_id)
		root_volume = "/dev/#{volume.target_path}"
    host_id = self.host_id
		host = Host.find(host_id)

		# check if the debian website is reachable
		raise "Debian Site unreachable, cannot continue with provsioning" if !check_connectivity
		threads = []
    vm_name = self.name
		
    Dblogger.log("Production", "system", "VM", "Provisioning VM: #{vm_name}")


		threads << Thread.new("provisioning-thread") do |thread|
			self.status = "provisioning"
			provision = Provisioning.new(root_volume, "/media/#{volume.name}", vm_name, @modules.chomp!, host.name, host.username)
			ActiveRecord::Base.connection.execute("UPDATE vms SET status = 'provisioned' WHERE name = '#{vm_name}' AND host_id = #{host_id};")
			ActiveRecord::Base.connection.execute("INSERT INTO log (user, subject, text) VALUES ('system', 'VM', 'Provisioning of VM: #{vm_name} completed');")
		end

	end

	def define_vm
		@host = Host.find(self.host_id)
		connection = ConnectionsManager.instance
		connection_hash = connection.get(@host.name)
		@conn = connection_hash[:conn]

		# get kernel files
		get_kernel_files

		# continue with VM creation only if a suitable kernel, proper architecture and related files were found
		if !(@vmlinuz.nil? || @initrd.nil? || @modules.nil? || @arch.nil?)
			# get a free vnc port for the VM on that specific Host
			assigned_vnc_port = get_vnc_port(@host)

			# set vnc_url
			self.vnc_url = "vnc://#{@host.name}:#{assigned_vnc_port}"

      # set max-mem for pv vms
      if self.ostype == "linux"
        self.max_memory = self.memory * 2
      end

			@domain = @conn.define_domain_xml(to_libvirt_xml(assigned_vnc_port))
			self.uuid = @domain.uuid
			raise "Could not define Domain" if !@domain

			# start provisioning if the VM is a paravirtualised one
			provision(@modules) if self.ostype == "linux"

			# release the reference to the domain object
			@domain.free
		end
	end

	def get_vnc_port(host)
		vnc = VncPort.new
		assigned_vnc_port = vnc.get_port(self.name, host.name)
		return assigned_vnc_port
	end

	def map_status(status_number)
		case status_number
		when 0
			status_text = Constants::VM_LIBVIRT_NOSTATE
		when 1
			status_text = Constants::VM_LIBVIRT_RUNNING
		when 2
			status_text = Constants::VM_LIBVIRT_BLOCKED
		when 3
			status_text = Constants::VM_LIBVIRT_PAUSED
		when 4
			status_text = Constants::VM_LIBVIRT_SHUTDOWN
		when 5
			status_text = Constants::VM_LIBVIRT_SHUTOFF
		when 6
			status_text = Constants::VM_LIBVIRT_CRASHED
		end

		return status_text
	end

	def manage_delete
    # delete all snapshots first
    snapshots = Snapshot.find_all_by_vm_id(self.id)
    snapshots.each do |snapshot|
      snapshot.destroy
    end

    # undefine VM
		host = Host.find(self.host_id)
		connection = ConnectionsManager.instance
		connection_hash = connection.get(host.name)
		conn = connection_hash[:conn]

		@domain = conn.lookup_domain_by_uuid(self.uuid)
		@domain.undefine
		@domain.free

		# set the vnc port for this VM free
		vnc = VncPort.new
		vnc.set_port_free(self.name, host.name)
	end

	def get_kernel_files
		host = Host.find_by_id(self.host_id)

		# check which kernel the node is running on. Check if it's a Xen Kernel and which Architecture it is based on
		Net::SSH.start(host.name, host.username, :auth_methods => "publickey", :timeout => Constants::SSH_Timeout) do |ssh|
			kernel_release = ssh.exec!("uname -r")
			@modules = String.new
			@arch = String.new

			case kernel_release
			when /(xen-amd64)$/
				Dblogger.log("Debug", "system", "VM", "Xen AMD64 Kernel found.")
				@modules = kernel_release
				@arch = "amd64"
			when /(xen-686)$/
				Dblogger.log("Debug", "system", "VM", "Xen 686 Kernel found.")
				@modules = kernel_release
				@arch = "686"
			else
				Dblogger.log("Production", "system", "VM", "No suitable Kernel found. Cannot create VM.")
				# set architecture related class attributes to nil due to error
				@vmlinuz, @initrd, @modules, @arch = nil, nil, nil, nil
			end

			@vmlinuz = "vmlinuz-#{kernel_release}"
			@initrd = "initrd.img-#{kernel_release}"
		end
	end

	def to_libvirt_xml(vnc_port_number)
		# set up target_device & target_bus for PV & HVM guests
		self.ostype == "linux" ? @target_device = "xvda" :  @target_device = "hdc"
		self.ostype == "linux" ? @target_bus = "xen" :  @target_bus = "ide"

		# set architecture related lib folder
		if @arch == "amd64"
			lib = "lib64"
		elsif @arch == "686"
			lib = "lib"
		end

		if self.ostype == "linux"
			# create a new XML document
			doc = XML::Document.new()
			# create the root element
			doc.root = XML::Node.new("domain")
			root = doc.root
			# define those attributes
			root["type"] = Constants::HYPERVISOR_TYPE

			# create name element
			root << name = XML::Node.new("name")
			name << self.name

			# if UUID has been already set, use that one (so the VM gets redefined)
			if !self.uuid.nil?
				root << uuid = XML::Node.new("uuid")
				uuid << self.uuid
			end

			# create memory element
			root << memory = XML::Node.new("memory")
			memory << self.memory.to_i * 1024

			# create vcpu element
			root << vcpu = XML::Node.new("vcpu")
			vcpu << self.vcpu

			# create bootloader element if specified
			if !self.bootloader = ""
				root << bootloader = XML::Node.new("bootloader")
				bootloader << self.bootloader
			end

			# create os parent element
			root << os = XML::Node.new("os")

			# create type element
			os << type = XML::Node.new("type")
			type << self.ostype

			# create kernel element
			os << kernel = XML::Node.new("kernel")
			kernel << "#{Constants::KERNEL_PATH}/#{@vmlinuz.chomp!}"

			# create initrd element
			os << initramdisk = XML::Node.new("initrd")
			initramdisk << "#{Constants::KERNEL_PATH}/#{@initrd.chomp!}"

			# create cmdline element
			os << cmdline = XML::Node.new("cmdline")
			cmdline << Constants::CMDLINE

			# create clock element
			root << clock = XML::Node.new("clock")
			clock["offset"] = Constants::CLOCK_OFFSET_LOCALTIME

			# create poweroff element
			root << poweroff = XML::Node.new("on_poweroff")
			poweroff << Constants::DESTROY

			# create reboot element
			root << reboot = XML::Node.new("on_reboot")
			reboot << Constants::RESTART

			# create crash element
			root << crash = XML::Node.new("on_crash")
			crash << Constants::RESTART

			# create devices parent element
			root << devices = XML::Node.new("devices")

			# create disk parent element
			devices << disk = XML::Node.new("disk")
			disk["type"] = Constants::DISK_TYPE
			disk["device"] = Constants::DISK_DEVICE

			# create driver element
			disk << driver = XML::Node.new("driver")
			driver["name"] = Constants::DRIVER_NAME

			# create source element
			volume = Volume.find(self.swapvolume_id)
			pool = Pool.find(volume.pool_id)
			source_device_swap = "/dev/#{pool.name}/#{volume.name}"
			disk << source = XML::Node.new("source")
			source["dev"] = source_device_swap

			# create target element
			disk << target = XML::Node.new("target")
			target["dev"] = Constants::TARGET_DEVICE_SWAP
			target["bus"] = Constants::BUS_TYPE

			# create disk parent element
			devices << disk = XML::Node.new("disk")
			disk["type"] = Constants::DISK_TYPE
			disk["device"] = Constants::DISK_DEVICE

			# create driver element
			disk << driver = XML::Node.new("driver")
			driver["name"] = Constants::DRIVER_NAME

			# create source element
			volume = Volume.find(self.rootvolume_id)
			#pool = Pool.find(volume.pool_id)
			source_device_root = "/dev/#{pool.name}/#{volume.name}"
			disk << source = XML::Node.new("source")
			source["dev"] = source_device_root

			# create target element
			disk << target = XML::Node.new("target")
			target["dev"] = Constants::TARGET_DEVICE_ROOT
			target["bus"] = Constants::BUS_TYPE

      # create a different CDROM element if a physical drive or an ISO image is being used
			cdrom_enabled = false
			if self.cdrom == "phy"
				# the physical drive shall be used
				cdrom_enabled = true

        # create CDROM for PV
        # create disk parent element
        devices << cdrom = XML::Node.new("disk")
        cdrom["type"] = Constants::DISK_TYPE
        cdrom["device"] = Constants::CDROM_DEVICE

        # create driver element
        cdrom << driver = XML::Node.new("driver")
        driver["name"] = Constants::DRIVER_NAME

        # create source element
        cdrom << source = XML::Node.new("source")
        source["dev"] = Constants::SOURCE_DEVICE_CDROM

			else
				iso = Iso.find(self.iso_id)
				if !iso.nil?
					# an ISO image over NFS is going to be used
					cdrom_enabled = true

					# create cdrom device element
					devices << cdrom = XML::Node.new("disk")
					cdrom["type"] = Constants::FILE_DEVICE
					cdrom["device"] = Constants::CDROM_DEVICE

					# create source element for cdrom
					cdrom << source = XML::Node.new("source")
					source["file"] = "#{Constants::NFS_MOUNT_PATH}/#{iso.filename}"
				end
			end

			if cdrom_enabled
				puts "CDROM ENABLED!"
				# create target element for cdrom
        cdrom << target = XML::Node.new("target")
        target["dev"] = @target_device
        target["bus"] = @target_bus
        # create readonly element for cdrom
        cdrom << readonly = XML::Node.new("readonly")
			end


			# create interface parent element
			devices << interface = XML::Node.new("interface")
			interface["type"] = Constants::INTERFACE_TYPE

			# add entry for physical Network Interface
			interface << source = XML::Node.new("source")
			if self.nic_id.nil?
				# create source element
				source["bridge"] = "eth0"
			else
				nic = Nic.find(self.nic_id)
				source["bridge"] = nic.name
			end

			# create target element
			interface << target = XML::Node.new("target")
			target["dev"] = Constants::INTERFACE_DEVICE

			# create console parent element
			devices << console = XML::Node.new("console")
			console["type"] = Constants::CONSOLE_TYPE
			console["tty"] = Constants::CONSOLE_TTY

			# create source element
			console << source = XML::Node.new("source")
			source["path"] = Constants::CONSOLE_TTY

			# create target element
			console << target = XML::Node.new("target")
			target["port"] = Constants::CONSOLE_TARGET_PORT

			# add mouse element
			devices << mouse = XML::Node.new("mouse")
			mouse["type"] = "mouse"
			mouse["bus"] = "xen"

			devices << graphics = XML::Node.new("graphics")
			graphics["type"] = "vnc"
			graphics["port"] = vnc_port_number.to_s

		elsif self.ostype == "hvm"
			# create a new XML document
			doc = XML::Document.new()
			# create the root element
			doc.root = XML::Node.new("domain")
			root = doc.root
			# define those attributes
			root["type"] = Constants::HYPERVISOR_TYPE

			# create name element
			root << name = XML::Node.new("name")
			name << self.name

			# if UUID has been already set, use that one
			if !self.uuid.nil?
				root << uuid = XML::Node.new("uuid")
				uuid << self.uuid
			end

			# create memory element
			root << memory = XML::Node.new("memory")
			memory << self.memory.to_i * 1024

			# create vcpu element
			root << vcpu = XML::Node.new("vcpu")
			vcpu << self.vcpu

			# create os parent element
			root << os = XML::Node.new("os")

			# create type element
			os << type = XML::Node.new("type")
			type << self.ostype

			# create loader element
			os << loader = XML::Node.new("loader")
			loader << "/usr/#{lib}/xen/boot/hvmloader"

			# create boot element (if none has been set, hd will be used)
			if self.boot_device.nil?
				self.boot_device = "cdrom"
			else
				self.boot_device = self.boot_device.downcase
			end

			os << boot = XML::Node.new("boot")
			boot["dev"] = self.boot_device

			# create features parent element
			root << features = XML::Node.new("features")
			# create pae element
			features << pae = XML::Node.new("pae")
			# create pae element
			features << acpi = XML::Node.new("acpi")
			# create pae element
			features << apic = XML::Node.new("apic")

			# create clock element
			root << clock = XML::Node.new("clock")
			clock["sync"] = Constants::CLOCK_OFFSET_LOCALTIME

			# create poweroff element
			root << poweroff = XML::Node.new("on_poweroff")
			poweroff << Constants::DESTROY

			# create reboot element
			root << reboot = XML::Node.new("on_reboot")
			reboot << Constants::RESTART

			# create crash element
			root << crash = XML::Node.new("on_crash")
			crash << Constants::RESTART

			# create devices parent element
			root << devices = XML::Node.new("devices")

			# create emulator element
			devices << emulator = XML::Node.new("emulator")
			emulator << "/usr/#{lib}/xen/bin/qemu-dm"

			# create disk parent element
			devices << disk = XML::Node.new("disk")
			disk["type"] = Constants::DISK_TYPE
			disk["device"] = Constants::DISK_DEVICE

			# create driver element
			disk << driver = XML::Node.new("driver")
			driver["name"] = Constants::DRIVER_NAME

			# create source element
			volume = Volume.find(self.rootvolume_id)
			pool = Pool.find(volume.pool_id)
			source_device_root = "/dev/#{pool.name}/#{volume.name}"
			disk << source = XML::Node.new("source")
			source["dev"] = source_device_root

			# create target element
			disk << target = XML::Node.new("target")
			target["dev"] = Constants::TARGET_DEVICE_ROOT_HVM
			target["bus"] = Constants::BUS_TYPE_IDE

			# create a different CDROM element if a physical drive or an ISO image is being used
			cdrom_enabled = false
			if self.cdrom == "phy"
				# the physical drive shall be used
				cdrom_enabled = true

				# create cdrom device element
				devices << cdrom = XML::Node.new("disk")
				cdrom["type"] = Constants::DISK_TYPE
				cdrom["device"] = Constants::CDROM_DEVICE

				# create driver element for cdrom
				cdrom << driver = XML::Node.new("driver")
				driver["name"] = Constants::DRIVER_NAME

				# create source element for cdrom
				cdrom << source = XML::Node.new("source")
				source["dev"] = Constants::SOURCE_DEVICE_CDROM
			else
				iso = Iso.find(self.iso_id)
				if !iso.nil?
					# an ISO image over NFS is going to be used
					cdrom_enabled = true

					# create cdrom device element
					devices << cdrom = XML::Node.new("disk")
					cdrom["type"] = Constants::FILE_DEVICE
					cdrom["device"] = Constants::CDROM_DEVICE

					# create source element for cdrom
					cdrom << source = XML::Node.new("source")
					source["file"] = "#{Constants::NFS_MOUNT_PATH}/#{iso.filename}"
				end
			end
			
			if cdrom_enabled
				# create target element for cdrom
				cdrom << target = XML::Node.new("target")
				target["dev"] = @target_device
				target["bus"] = @target_bus
			end

			# create readonly element for cdrom
			cdrom << readonly = XML::Node.new("readonly")

			# create interface parent element
			devices << interface = XML::Node.new("interface")
			interface["type"] = Constants::INTERFACE_TYPE

			# add entry for physical Network Interface
			interface << source = XML::Node.new("source")
			if self.nic_id.nil?
				# create source element
				source["bridge"] = "eth0"
			else
				nic = Nic.find(self.nic_id)
				source["bridge"] = nic.name
			end

			# create tablet input element
			devices << input = XML::Node.new("input")
			input["type"] = "tablet"
			input["bus"] = "usb"

			# create mouse input element
			devices << input = XML::Node.new("input")
			input["type"] = "mouse"
			input["bus"] = "ps2"

			# experimental version:
			devices << graphics = XML::Node.new("graphics")
			graphics["type"] = "vnc"
			graphics["port"] = vnc_port_number.to_s
			graphics["listen"] = "0.0.0.0"

		end

		puts doc.to_s
		return doc.to_s
	end


	def check_connectivity
		# there are environments, that disable ping. so try to connect via http instead of a ICMP Ping request
		url = URI.parse('http://ftp.debian.org/debian/')
		req = Net::HTTP::Get.new(url.path)
		res = Net::HTTP.start(url.host, url.port) {|http|
			http.request(req)
		}

		status = true
		begin
			status = true if !res.value.nil?
		rescue
			status = false
		end

		return status
	end

	def xml_define_vm(host, conn)
		#get the VNC Port already assigned to the VM and redefine the vm
		vnc_port = get_vnc_port(host)

		# get kernel files
		get_kernel_files

		conn.define_domain_xml(to_libvirt_xml(vnc_port))
	end
end
