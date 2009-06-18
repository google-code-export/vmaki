class CreateSnapshots < ActiveRecord::Migration
  def self.up
    create_table :snapshots do |t|
      t.string :name
      t.text :description
      t.string :status
      t.decimal :size
      t.integer :vm_id

      t.timestamps
    end
  end

  def self.down
    drop_table :snapshots
  end
end
