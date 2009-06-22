require 'net/ssh'
require 'constants'

class Nic < ActiveRecord::Base
	belongs_to :host
	has_many :vms

	def self.retrieve(host_id)
		host = Host.find(host_id)
    existing_nics = Nic.find_by_host_id(host_id)
    if existing_nics.nil?
      nics_array = Array.new
      Net::SSH.start(host.name, host.username, :auth_methods => "publickey", :timeout => Constants::SSH_Timeout) do |ssh|
        nics = ssh.exec!("ifconfig | grep ^eth | cut -c1-5")
        nics.each { |s| nics_array << s.chomp.chop }
      end
      nics_array.each do |nic|
        self.create(:name => nic, :host_id => host_id)
      end
    end
  end
end
