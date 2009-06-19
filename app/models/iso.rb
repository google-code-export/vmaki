require 'constants'

class Iso < ActiveRecord::Base
	belongs_to :host
	validates_uniqueness_of :filename

	before_update :manage_update
	before_destroy :manage_delete

	def upload_data(filename, description, data)
		self.filename = filename
		self.description = description
		
		data.rewind

    full_path = "#{Constants::NFS_SOURCE_PATH}/#{self.filename}"
		File.open(full_path,"wb") do |file|
			while buffer = data.read(4096)
				file.write(buffer)
			end
		end

		# set the size of the uploaded file in Megabytes
		self.size = sprintf("%.2f", (File.size(full_path).to_f / 1024 / 1024).to_f)
	end

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
