class AddAllocationToVolumes < ActiveRecord::Migration
  def self.up
		add_column :volumes, :allocation, :float
  end

  def self.down
		remove_column :volumes, :allocation
  end
end
