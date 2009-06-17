require 'constants'

class Iso < ActiveRecord::Base
	belongs_to :host
	validates_uniqueness_of :filename

	before_update :manage_update
	before_destroy :manage_delete
	
	private

	def manage_update
		# check if filename attribute has been changed and if yes, change the physical filename as well
		if self.filename_changed?
			puts `mv #{Constants::NFS_SOURCE_PATH}/#{self.filename_was} #{Constants::NFS_SOURCE_PATH}/#{self.filename}`
		end

	end

	def manage_delete
    puts `rm #{Constants::NFS_SOURCE_PATH}/#{self.filename}`
	end
end
