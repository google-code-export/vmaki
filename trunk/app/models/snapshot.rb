class Snapshot < ActiveRecord::Base
	validates_uniqueness_of :name

	belongs_to :vm

	before_create :set_name

	def set_name
		vm = Vm.find_by_id(self.vm_id)
		snapshots = Snapshot.find(:all, :conditions => {:vm_id => self.vm_id} )
		snapshot_nr = snapshots.size + 1
		self.name = "#{vm.name}-snapshot-#{snapshot_nr}"
	end
end
