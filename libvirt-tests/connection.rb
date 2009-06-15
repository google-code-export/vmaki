require "rubygems"
require "libvirt"
require "singleton"

class Connection
	include Singleton
	attr_reader :conn, :hostname
		
	def open(connection_string)
    @conn = Libvirt::open(connection_string)
		@hostname = @conn.hostname
  end

	def lookup_domain_by_id(id)
		return @conn.lookup_domain_by_id(id)
	end

	def disconnect
		@conn.close
		puts "conn: #{@conn}"
		puts "connection closed? #{@conn.closed?}"
		@conn = nil
		#Process.exit!
		err = Libvirt::Error.new
		puts err.libvirt_function_name
		puts err.libvirt_message
	end
end

connection = Connection.instance
connection.open("xen+ssh://root@localhost")
conn = connection.conn
puts "Connected to: #{connection.hostname}"
puts conn.capabilities
connection.disconnect
puts "bla"

