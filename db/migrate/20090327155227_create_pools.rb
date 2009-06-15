class CreatePools < ActiveRecord::Migration
  def self.up
    create_table :pools do |t|
			t.string :name
      t.integer :host_id

      t.timestamps
    end
  end

  def self.down
    drop_table :pools
  end
end
