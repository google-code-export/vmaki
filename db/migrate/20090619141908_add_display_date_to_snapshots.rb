class AddDisplayDateToSnapshots < ActiveRecord::Migration
  def self.up
    add_column :snapshots, :display_date, :string
  end

  def self.down
    remove_column :snapshots, :display_date
  end
end
