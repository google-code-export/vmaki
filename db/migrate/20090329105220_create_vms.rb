class CreateVms < ActiveRecord::Migration
  def self.up
    create_table :vms do |t|
			t.string :name
      t.integer :memory
      t.integer :vcpu
      t.string :bootloader
      t.string :ostype
			t.string :current_status
			t.string :set_status
			t.integer :host_id
      t.integer :swapvolume_id
      t.integer :rootvolume_id
			t.timestamps
    end
  end

  def self.down
    drop_table :vms
  end
end
