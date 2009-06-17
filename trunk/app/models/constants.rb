
class Constants
  SSH_Timeout = 10
	LVM = "logical"
	HYPERVISOR_TYPE = "xen"
	HVM_TYPE = "hvm"
	KERNEL_PATH = "/boot"
	CMDLINE = "root=/dev/sda2 ro ip=:1.2.3.4::::eth0:dhcp"
	DESTROY = "destroy"
	RESTART = "restart"
	DISK_TYPE = "block"
	DISK_DEVICE = "disk"
	CDROM_DEVICE = "cdrom"
	SOURCE_DEVICE_CDROM = "/dev/scd0"
	FILE_DEVICE = "file"
	DRIVER_NAME = "phy"
	NFS_MOUNT_PATH = "/mnt/tmp"
  NFS_SOURCE_PATH = "/isos"
	BUS_TYPE = "scsi"
	OS_TYPE_XPATH = "//capabilities/guest/os_type"
	CLOCK_OFFSET_LOCALTIME = "localtime"
	TARGET_DEVICE_SWAP = "sda1"
	TARGET_DEVICE_ROOT = "sda2"
	INTERFACE_TYPE = "bridge"
	INTERFACE_DEVICE = "vif1.0"
	CONSOLE_TYPE = "pty"
	CONSOLE_TTY = "/dev/pts/1"
	CONSOLE_TARGET_PORT = "0"
	PERMISSIONS_MODE = "060660"
	PERMISSIONS_OWNER = "0"
	PERMISSIONS_GROUP = "6"
	ADMINISTRATOR_ROLE = "Administrator"
	USER_ROLE = "User"
	VNC_BASE_PORT = 5900
	VM_LIBVIRT_NOSTATE = "nostate"   # 0; no state
	VM_LIBVIRT_RUNNING = "running"   # 1; the domain is running
	VM_LIBVIRT_BLOCKED = "blocked"   # 2; the domain is blocked on resource
	VM_LIBVIRT_PAUSED	= "paused"     # 3; the domain is paused by user
	VM_LIBVIRT_SHUTDOWN	= "shutdown" # 4; the domain is being shut down
	VM_LIBVIRT_SHUTOFF = "shutoff"   # 5; the domain is shut off
	VM_LIBVIRT_CRASHED = "crashed"   # 6; the domain is crashed
end