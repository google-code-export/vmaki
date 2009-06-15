require 'net/ssh'
require 'net/sftp'

class Provisioning
  def initialize(volume, base, vmname, modules, hostname, username)
		@hostname = hostname
		@username = username
    mount_volume(volume, base)
    provision_and_mount_pseudo_filesystems(base, "http://ftp.debian.org/debian", modules, vmname)
    chroot_and_filecopy(base, vmname)
    unmount(base)
		puts "done provisioning!"
  end

  private

  def mount_volume(volume, basedir)
    puts "mount"
    Net::SSH.start(@hostname, @username, :auth_methods => "publickey", :timeout => 2) do |ssh|
      puts ssh.exec!("mkdir -p #{basedir}")
      puts ssh.exec!("mount -t ext3 #{volume} #{basedir}")
			puts ssh.exec!("mkdir -p #{basedir}/lib/modules")
    end
  end

  def provision_and_mount_pseudo_filesystems(basedir, debian_url, modules, vmname)
    puts "provision"
		puts "Using modules: #{modules}"
		Net::SSH.start(@hostname, @username, :auth_methods => "publickey", :timeout => 2) do |ssh|
      puts ssh.exec!("debootstrap lenny #{basedir} #{debian_url}")
			puts ssh.exec!("cp -rfd /lib/modules/#{modules} #{basedir}/lib/modules")
      puts ssh.exec!("mount -o bind /dev #{basedir}/dev")
      puts ssh.exec!("mount -o bind /proc #{basedir}/proc")
			puts "echo > #{vmname} #{basedir}/etc/hostname"
			puts ssh.exec!("echo #{vmname} > #{basedir}/etc/hostname")
    end
  end

  def chroot_and_filecopy(basedir, vmname)
    # synonym for newline
    endl = "\n"

    #inittab = "# /etc/inittab: init(8) configuration." + endl
    #inittab << "# $Id: inittab,v 1.91 2002/01/25 13:35:21 miquels Exp $" + endl
    #inittab << endl
    #inittab << "# The default runlevel." + endl
    #inittab << "id:2:initdefault:" + endl
    #inittab << endl
    #inittab << "# Boot-time system configuration/initialization script." + endl
    #inittab << "# This is run first except when booting in emergency (-b) mode." + endl
    #inittab << "si::sysinit:/etc/init.d/rcS" + endl
    #inittab << endl
    #inittab << "# What to do in single-user mode." + endl
    #inittab << "~~:S:wait:/sbin/sulogin" + endl
    #inittab << endl
    #inittab << "# /etc/init.d executes the S and K scripts upon change" + endl
    #inittab << "# of runlevel." + endl
    #inittab << "#" + endl
    #inittab << "# Runlevel 0 is halt." + endl
    #inittab << "# Runlevel 1 is single-user." + endl
    #inittab << "# Runlevels 2-5 are multi-user." + endl
    #inittab << "# Runlevel 6 is reboot." + endl
    #inittab << endl
    #inittab << "l0:0:wait:/etc/init.d/rc 0" + endl
    #inittab << "l1:1:wait:/etc/init.d/rc 1" + endl
    #inittab << "l2:2:wait:/etc/init.d/rc 2" + endl
    #inittab << "l3:3:wait:/etc/init.d/rc 3" + endl
    #inittab << "l4:4:wait:/etc/init.d/rc 4" + endl
    #inittab << "l5:5:wait:/etc/init.d/rc 5" + endl
    #inittab << "l6:6:wait:/etc/init.d/rc 6" + endl
    #inittab << "# Normally not reached, but fallthrough in case of emergency." + endl
    #inittab << "z6:6:respawn:/sbin/sulogin" + endl
    #inittab << endl
    #inittab << "# What to do when CTRL-ALT-DEL is pressed." + endl
    #inittab << "ca:12345:ctrlaltdel:/sbin/shutdown -t1 -a -r now" + endl
    #inittab << endl
    #inittab << "# What to do when the power fails/returns." + endl
    #inittab << "pf::powerwait:/etc/init.d/powerfail start" + endl
    #inittab << "pn::powerfailnow:/etc/init.d/powerfail now" + endl
    #inittab << "po::powerokwait:/etc/init.d/powerfail stop" + endl
    #inittab << endl
    #inittab << "# /sbin/getty invocations for the runlevels." + endl
    #inittab << "#" + endl
    #inittab << "# The 'id' field MUST be the same as the last" + endl
    #inittab << "# characters of the device (after 'tty')." + endl
    #inittab << "#" + endl
    #inittab << "# Format:" + endl
    #inittab << "#  <id>:<runlevels>:<action>:<process>" + endl
    #inittab << "#" + endl
    #inittab << "# Note that on most Debian systems tty7 is used by the X Window System," + endl
    #inittab << "# so if you want to add more getty's go ahead but skip tty7 if you run X." + endl
    #inittab << "#" + endl
    #inittab << "1:2345:respawn:/sbin/getty 38400 tty1" + endl

    fstab = "/dev/sda1  none  swap sw                 0 0" + endl
    fstab << "/dev/sda2 /     ext3 errors=remount-ro  0 1" + endl
    fstab << "proc      /proc proc defaults           0 0" + endl
    fstab << "none      /dev/pts   devpts             0 0" + endl

    interfaces = "# This file describes the network interfaces available on your system" + endl
    interfaces << "# and how to activate them. For more information, see interfaces(5)." + endl
    interfaces << endl
    interfaces << "auto lo eth0" + endl
    interfaces << "iface lo inet loopback" + endl
    interfaces << "iface eth0 inet dhcp" + endl

		hostname = vmname

    puts "chroot"
    Net::SFTP.start(@hostname, @username, :auth_methods => "publickey", :timeout => 2) do |sftp|
      # write inittab
      #sftp.file.open("#{basedir}/etc/inittab", IO::WRONLY|IO::CREAT) do |file|
      #  inittab.each do |data|
      #    file.puts data
      #  end
      #end

      # write fstab
			puts "fstab"
      sftp.file.open("#{basedir}/etc/fstab", IO::WRONLY|IO::CREAT) do |file|
        fstab.each do |data|
          file.puts data
        end
      end

      # write interfaces
			puts "interfaces"
      sftp.file.open("#{basedir}/etc/network/interfaces", IO::WRONLY|IO::CREAT) do |file|
        interfaces.each do |data|
          file.puts data
        end
      end
    end
		puts "apt-get stuff"
    Net::SSH.start(@hostname, @username, :auth_methods => "publickey", :timeout => 2) do |ssh|
      puts ssh.exec!("chroot #{basedir} apt-get update")
			puts ssh.exec!("chroot #{basedir} apt-get install libc6 udev -y")
    end
  end

  def unmount(basedir)
    puts "unmount"
    Net::SSH.start(@hostname, @username, :auth_methods => "publickey", :timeout => 2) do |ssh|
      puts ssh.exec!("umount #{basedir}/dev")
      puts ssh.exec!("umount #{basedir}/proc")
      puts ssh.exec!("umount #{basedir}")
			puts ssh.exec!("rm -rf #{basedir}")
    end
  end
end