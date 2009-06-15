class CreateVolumes < ActiveRecord::Migration
  def self.up
    create_table :volumes do |t|
			t.string :name
			t.string :source_path
      t.float :capacity
			t.string :vol_type
      t.integer :pool_id

      t.timestamps
    end
  end

  def self.down
    drop_table :volumes
  end
end
