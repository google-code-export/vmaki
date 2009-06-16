class Iso < ActiveRecord::Base
	belongs_to :host
	validates_uniqueness_of :filename

	before_update :manage_update
	before_destroy :manage_delete
	
	private

	def manage_update
		# check if filename attribute has been changed and if yes, change the physical filename as well
		if self.filename_changed?
			path = "/isos"
			puts `mv #{path}/#{self.filename_was} #{path}/#{self.filename}`
		end

	end

	def manage_delete
			path = "/isos"
			
			#puts `rm #{path}/#{self.filename}`
	end
end
