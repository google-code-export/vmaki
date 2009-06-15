class CreateNics < ActiveRecord::Migration
  def self.up
    create_table :nics do |t|
      t.string :name
			t.integer :host_id
			
      t.timestamps
    end
  end

  def self.down
    drop_table :nics
  end
end
