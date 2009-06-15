class AlterNicToNicIdIntegerInVms < ActiveRecord::Migration
  def self.up
		remove_column :vms, :nic
		add_column :vms, :nic_id, :integer
  end

  def self.down
		remove_column :vms, :nic_id
		add_column :vms, :nic, :string
  end
end
