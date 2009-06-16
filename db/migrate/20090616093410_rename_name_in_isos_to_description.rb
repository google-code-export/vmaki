class RenameNameInIsosToDescription < ActiveRecord::Migration
  def self.up
		rename_column :isos, :name, :description
  end

  def self.down
		rename_column :isos, :description, :name
  end
end
