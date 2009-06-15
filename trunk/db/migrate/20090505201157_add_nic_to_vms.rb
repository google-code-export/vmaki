class AddNicToVms < ActiveRecord::Migration
  def self.up
		add_column :vms, :nic, :string
  end

  def self.down
		remove_column :vms, :nic
  end
end
