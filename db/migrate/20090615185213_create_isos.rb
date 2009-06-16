class CreateIsos < ActiveRecord::Migration
  def self.up
    create_table :isos do |t|
			t.string :name
      t.string :filename
      t.decimal :size

      t.timestamps
    end
  end

  def self.down
    drop_table :isos
  end
end
