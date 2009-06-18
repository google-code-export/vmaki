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
    Net::SSH.start(@hostname, @username, :auth_methods => "publickey", :timeout => Constants::SSH_Timeout) do |ssh|
      puts ssh.exec!("mkdir -p #{basedir}")
      puts ssh.exec!("mount -t ext3 #{volume} #{basedir}")
			puts ssh.exec!("mkdir -p #{basedir}/lib/modules")
    end
  end

  def provision_and_mount_pseudo_filesystems(basedir, debian_url, modules, vmname)
    puts "provision"
		puts "Using modules: #{modules}"
		Net::SSH.start(@hostname, @username, :auth_methods => "publickey", :timeout => Constants::SSH_Timeout) do |ssh|
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

		#hostname = vmname

    puts "chroot"
    Net::SFTP.start(@hostname, @username, :auth_methods => "publickey", :timeout => Constants::SSH_Timeout) do |sftp|
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
    Net::SSH.start(@hostname, @username, :auth_methods => "publickey", :timeout => Constants::SSH_Timeout) do |ssh|
      puts ssh.exec!("chroot #{basedir} apt-get update")
			puts ssh.exec!("chroot #{basedir} apt-get install libc6 udev -y")
    end
  end

  def unmount(basedir)
    puts "unmount"
    Net::SSH.start(@hostname, @username, :auth_methods => "publickey", :timeout => Constants::SSH_Timeout) do |ssh|
      puts ssh.exec!("umount #{basedir}/dev")
      puts ssh.exec!("umount #{basedir}/proc")
      puts ssh.exec!("umount #{basedir}")
			puts ssh.exec!("rm -rf #{basedir}")
    end
  end
end