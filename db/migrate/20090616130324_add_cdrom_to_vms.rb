class AddCdromToVms < ActiveRecord::Migration
  def self.up
		add_column :vms, :cdrom, :string, :default => "phy"
  end

  def self.down
		remove_column :vms, :cdrom
  end
end
