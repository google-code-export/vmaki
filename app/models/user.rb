require "digest/sha1"

class User < ActiveRecord::Base
	validates_uniqueness_of :name

	before_save :hash_password

	def self.authenticate(username, password)
		u = find_by_name(username)
		hashed_password = Digest::SHA1.hexdigest(password)
		# if authentication succeeds, return the user object
    if u
      return u if username == u.name && hashed_password == u.password
    end
	end

	private

  # Sets the password to a hashed version
  def hash_password
    self.password = Digest::SHA1.hexdigest(self.password)
  end

end
