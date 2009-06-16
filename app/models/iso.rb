class Iso < ActiveRecord::Base
	  belongs_to :host
		validates_uniqueness_of :filename
end
