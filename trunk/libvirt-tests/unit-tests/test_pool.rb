# To change this template, choose Tools | Templates
# and open the template in the editor.

$:.unshift File.join(File.dirname(__FILE__),'..','lib')

require 'test/unit'
require 'pool'
require "connection"

class TestPool < Test::Unit::TestCase
  def test_initialize
		connection = Connection.instance
		conn = connection.conn
		assert(!Pool.new(conn, "xenhost").nil?, "Pool is not accessible...")
  end
end
