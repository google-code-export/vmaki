class AddTargetPathToVolumes < ActiveRecord::Migration
  def self.up
		add_column :volumes, :target_path, :string
  end

  def self.down
		remove_column :volumes, :target_path
  end
end
