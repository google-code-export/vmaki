class CreateDbloggers < ActiveRecord::Migration
  def self.up
    create_table :dbloggers do |t|
			t.string :user
      t.string :subject
      t.text :text
      t.timestamp :created_at
    end
  end

  def self.down
    drop_table :dbloggers
  end
end
