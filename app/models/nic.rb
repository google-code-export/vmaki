require 'net/ssh'

class Nic < ActiveRecord::Base
	belongs_to :host
	has_many :vms

	def self.retrieve(host_id)
		host = Host.find(host_id)
		nics_array = Array.new
		Net::SSH.start(host.name, host.username, :auth_methods => "publickey", :timeout => 2) do |ssh|
			nics = ssh.exec!("ifconfig | grep ^eth | cut -c1-5")
			nics.each { |s| nics_array << s.chomp.chop }
		end
		puts nics_array
		nics_array.each do |nic|
			self.create(:name => nic, :host_id => host_id)
		end
  end
end
