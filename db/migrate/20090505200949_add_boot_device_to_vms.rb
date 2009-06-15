class AddBootDeviceToVms < ActiveRecord::Migration
  def self.up
		add_column :vms, :boot_device, :string
  end

  def self.down
		remove_column :vms, :boot_device
  end
end
