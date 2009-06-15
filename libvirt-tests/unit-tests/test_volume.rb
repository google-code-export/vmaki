# To change this template, choose Tools | Templates
# and open the template in the editor.

$:.unshift File.join(File.dirname(__FILE__),'..','lib')

require 'test/unit'
require 'volume'
require "connection"
require "libvirt"

class TestVolume < Test::Unit::TestCase
	def test_00_shut_down_vm
		connection = Connection.instance
		conn = connection.conn
		domain = conn.lookup_domain_by_name("deb02")
		puts "shutting down domain first"
		#domain.shutdown
		assert(domain.destroy.nil?, "Domain could not be destroyed")
	end
	
	def test_01_delete_root_and_swap_volumes
		connection = Connection.instance
		conn = connection.conn

		puts "doing some cleaning up..."
		terminator = Volume.new(conn)
		terminator.delete("xenhost", "deb02-root")
		terminator.delete("xenhost", "deb02-swap")
	end

  def test_02_create_root_volume
		connection = Connection.instance
		conn = connection.conn

		root = Volume.new(conn)
		assert(root.create("xenhost", "deb02-root", "sdd2", "5"), "Root volume could not be created!")
  end

	def test_03_create_swap_volume
		connection = Connection.instance
		conn = connection.conn
		
		swap = Volume.new(conn)
		assert(swap.create("xenhost", "deb02-swap", "sdd2", "0.5", "swap"), "Swap volume could not be created!")

	end
end
