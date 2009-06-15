class AddLoggingLevelToLog < ActiveRecord::Migration
  def self.up
		add_column :log, :log_level, :string
  end

  def self.down
		remove_column :log, :log_level
  end
end
