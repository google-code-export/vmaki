class AddMkfsToVolumes < ActiveRecord::Migration
  def self.up
		add_column :volumes, :mkfs, :boolean, :default => false
  end

  def self.down
		remove_column :volumes, :mkfs
  end
end
