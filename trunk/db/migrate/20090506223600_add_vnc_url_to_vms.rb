class AddVncUrlToVms < ActiveRecord::Migration
  def self.up
		add_column :vms, :vnc_url, :string
  end

  def self.down
		remove_column :vms, :vnc_url
  end
end
