#TODO #2: Creating (defining & launching) a VM should be transfered into this class!

require "rubygems"
require "xml/libxml"
require "constants.rb"

class VM
	attr_reader :id, :name, :memory, :vcpu, :bootloader, :os_type, :clock_offset, :source_device_swap, :source_device_root

  def initialize(id, name, memory, vcpu, bootloader, os_type, clock_offset, source_device_swap, source_device_root)
		@id = id
		@name = name
		@memory = memory.to_i * 1024
		@vcpu = vcpu
		@bootloader = bootloader
		@os_type = os_type
		@clock_offset = clock_offset
		@source_device_swap = source_device_swap
		@source_device_root = source_device_root
  end

	def to_xml
		# create a new XML document
		doc = XML::Document.new()
		# create the root element
		doc.root = XML::Node.new("domain")
		root = doc.root
		# define those attributes
		root["type"] = Constants::HYPERVISOR_TYPE
		root["id"] = "1"

		# create name element
		root << name = XML::Node.new("name")
		name << @name

		# create memory element
		root << memory = XML::Node.new("memory")
		memory << @memory
		
		# create vcpu element
		root << vcpu = XML::Node.new("vcpu")
		vcpu << @vcpu

		# create bootloader element
		root << bootloader = XML::Node.new("bootloader")
		bootloader << @bootloader

		# create os parent element
		root << os = XML::Node.new("os")

			# create type element
			os << type = XML::Node.new("type")
			type << @os_type

			# create kernel element
			os << kernel = XML::Node.new("kernel")
			kernel << Constants::KERNEL

			# create initrd element
			os << initrd = XML::Node.new("initrd")
			initrd << Constants::INITRD

			# create cmdline element
			os << cmdline = XML::Node.new("cmdline")
			cmdline << Constants::CMDLINE

		# create clock element
		root << clock = XML::Node.new("clock")
		clock["offset"] = @clock_offset

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
				disk << source = XML::Node.new("source")
				source["dev"] = @source_device_swap

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
				disk << source = XML::Node.new("source")
				source["dev"] = @source_device_root

				# create target element
				disk << target = XML::Node.new("target")
				target["dev"] = Constants::TARGET_DEVICE_ROOT
				target["bus"] = Constants::BUS_TYPE

			# create interface parent element
			devices << interface = XML::Node.new("interface")
			interface["type"] = Constants::INTERFACE_TYPE

				# create source element
				interface << source = XML::Node.new("source")
				source["bridge"] = "xenbr0"

				# create mac element
				interface << mac = XML::Node.new("mac")
				#mac["address"] = "00:16:3e:3f:14:86"

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

		return doc.to_s
	end
end