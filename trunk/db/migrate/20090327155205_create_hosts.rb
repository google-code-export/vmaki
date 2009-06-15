class CreateHosts < ActiveRecord::Migration
  def self.up
    create_table :hosts do |t|
      t.string :name
			t.string :connection_type
			t.string :username
			t.string :password
			t.boolean :connect, :default => false
			t.boolean :connected, :default => false

      t.timestamps
    end
  end

  def self.down
    drop_table :hosts
  end
end
