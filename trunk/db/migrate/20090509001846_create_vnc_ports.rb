class CreateVncPorts < ActiveRecord::Migration
  def self.up
    create_table :vnc_ports do |t|
			t.integer :port
			t.string :vmname
			t.string :hostname
      t.timestamps
    end
  end

  def self.down
    drop_table :vnc_ports
  end
end
