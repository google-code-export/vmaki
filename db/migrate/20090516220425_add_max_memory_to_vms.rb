class AddMaxMemoryToVms < ActiveRecord::Migration
  def self.up
		add_column :vms, :max_memory, :integer
  end

  def self.down
  end
end
