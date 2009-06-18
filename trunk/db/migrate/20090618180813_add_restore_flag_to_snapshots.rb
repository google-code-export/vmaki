class AddRestoreFlagToSnapshots < ActiveRecord::Migration
  def self.up
		add_column :snapshots, :restore, :boolean
  end

  def self.down
		remove_column :snapshots, :restore
  end
end
