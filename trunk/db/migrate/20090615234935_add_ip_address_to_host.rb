class AddIpAddressToHost < ActiveRecord::Migration
  def self.up
		add_column :hosts, :ip_address, :string
  end

  def self.down
		remove_column:hosts, :ip_address
  end
end
