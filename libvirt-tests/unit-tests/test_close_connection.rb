# To change this template, choose Tools | Templates
# and open the template in the editor.

$:.unshift File.join(File.dirname(__FILE__),'..','lib')

require 'test/unit'
require 'connection'

class TestCloseConnection < Test::Unit::TestCase
  def test_close_connection
		puts "Closing connection..."
		connection = Connection.instance
		conn = connection.conn

		fork do
			fork do
				connection.disconnect
			end
		end
		
		assert(conn.closed?, "Connection could not be closed")
		puts "Connection closed."
		Process.exit!
  end
end
