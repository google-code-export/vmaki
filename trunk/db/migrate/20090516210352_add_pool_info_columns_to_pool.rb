class AddPoolInfoColumnsToPool < ActiveRecord::Migration
  def self.up
		add_column :pools, :allocation, :float
		add_column :pools, :available, :float
		add_column :pools, :capacity, :float
		add_column :pools, :state, :integer
		add_column :pools, :num_of_volumes, :integer
  end

  def self.down
		remove_column :pools, :allocation
		remove_column :pools, :available
		remove_column :pools, :capacity
		remove_column :pools, :state
		remove_column :pools, :num_of_volumes
  end
end
