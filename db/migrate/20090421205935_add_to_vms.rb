class AddToVms < ActiveRecord::Migration
  def self.up
		add_column :vms, :uuid, :string
  end

  def self.down
		remove_column :vms, :uuid
  end
end
