class RenameDbloggersToLog < ActiveRecord::Migration
  def self.up
		rename_table :dbloggers, :log
  end

  def self.down
		rename_table :log, :dbloggers
  end
end
