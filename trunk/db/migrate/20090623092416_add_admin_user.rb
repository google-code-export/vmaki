class AddAdminUser < ActiveRecord::Migration
  def self.up
		User.create :name => "admin", :password => "admin", :role => "Administrator"
  end
end
