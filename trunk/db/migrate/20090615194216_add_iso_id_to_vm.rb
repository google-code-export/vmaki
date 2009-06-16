class AddIsoIdToVm < ActiveRecord::Migration
  def self.up
		add_column :vms, :iso_id, :integer
  end

  def self.down
		remove_column :vms, :iso_id
  end
end
