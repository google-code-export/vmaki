class AddLockVersion < ActiveRecord::Migration
  def self.up
		add_column :hosts, :lock_version, :integer, :Default => 0
		add_column :vms, :lock_version, :integer, :Default => 0
		add_column :users, :lock_version, :integer, :Default => 0
		add_column :snapshots, :lock_version, :integer, :Default => 0
		add_column :isos, :lock_version, :integer, :Default => 0
  end

  def self.down
		remove_column :hosts, :lock_version
		remove_column :vms, :lock_version
		remove_column :users, :lock_version
		remove_column :snapshots, :lock_version
		remove_column :isos, :lock_version
  end
end
