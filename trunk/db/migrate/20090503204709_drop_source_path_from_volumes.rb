class DropSourcePathFromVolumes < ActiveRecord::Migration
  def self.up
		remove_column :volumes, :source_path
  end

  def self.down
		add_column :volumes, :source_path, :string
  end
end
