$:.unshift File.join(File.dirname(__FILE__),'..','lib')

require "test/unit"
require "v_m"
require "rubygems"
require "constants"
require "connection"
require "libvirt"

class Test_VM < Test::Unit::TestCase
	
  def test_00_undefine_vm
		connection = Connection.instance
		conn = connection.conn
		
		domain = conn.lookup_domain_by_name("deb02")
		domain.undefine
		assert(!domain.nil?, "Domain could not be undefined")
	end

  def test_01_define_vm
		connection = Connection.instance
		conn = connection.conn
		
		newvm = VM.new(1, "deb02", 256, 1, "", "linux", Constants::CLOCK_OFFSET_UTC, "xenhost/deb02-swap", "xenhost/deb02-root")

		#If you want to see the XML of the domain to be created, uncomment the following line:
		#puts newvm.to_xml
		puts "Defining new VM..."
		@@domain = conn.define_domain_xml(newvm.to_xml)
		assert(!@@domain.nil?, "Domain could not be defined")
		puts "done."
  end

	def test_02_create_vm
		connection = Connection.instance
		conn = connection.conn

		puts "Creating new VM..."
		assert(@@domain.create.nil?, "Domain could not be created")
		puts "done."
	end

end
