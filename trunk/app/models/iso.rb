class Iso < ActiveRecord::Base
	belongs_to :host
	validates_uniqueness_of :filename

	before_update :manage_update
	
	private

	def manage_update
		# check if filename attribute has been changed and if yes, change the physical filename as well
		if self.filename_changed?
			path = "/isos"
			puts `mv #{isos}/#{self.filename_was} #{isos}/#{self.filename}`
		end

	end
end
