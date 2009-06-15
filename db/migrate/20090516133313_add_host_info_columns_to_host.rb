class AddHostInfoColumnsToHost < ActiveRecord::Migration
  def self.up
		add_column :hosts, :cpus, :integer
		add_column :hosts, :cores, :integer
		add_column :hosts, :total_memory, :integer
		add_column :hosts, :memory, :integer
		add_column :hosts, :mhz, :integer
		add_column :hosts, :model, :string
		add_column :hosts, :nodes, :integer
		add_column :hosts, :sockets, :integer
		add_column :hosts, :threads, :integer
		add_column :hosts, :hvm_support, :boolean
  end

  def self.down
		remove_column :hosts, :cpus
		remove_column :hosts, :cores
		remove_column :hosts, :total_memory
		remove_column :hosts, :memory
		remove_column :hosts, :mhz
		remove_column :hosts, :model
		remove_column :hosts, :nodes
		remove_column :hosts, :sockets
		remove_column :hosts, :threads
		remove_column :hosts, :hvm_support
  end
end
