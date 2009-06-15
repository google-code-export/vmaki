# To change this template, choose Tools | Templates
# and open the template in the editor.

$:.unshift File.join(File.dirname(__FILE__),'..','lib')

require 'test/unit'
require 'connection'

class TestOpenConnection < Test::Unit::TestCase
  def test_open_connection
		puts "Opening connection..."
		connection = Connection.instance
		connection.open("xen+ssh://root@localhost")
		assert(!connection.conn.nil?, "Connection could not be opened!")
		puts "Connected to: #{connection.hostname}"
  end
end
