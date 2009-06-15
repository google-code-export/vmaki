class RenameVms < ActiveRecord::Migration
  def self.up
		rename_column :vms, :current_status, :status
		rename_column :vms, :set_status, :action
  end

  def self.down
		rename_column :vms, :status, :current_status
		rename_column :vms, :action, :set_status
  end
end
