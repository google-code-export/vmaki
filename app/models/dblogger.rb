class Dblogger < ActiveRecord::Base
	# tell Rails which database table to use (using "dbloggers" as a tablename would be ugly and inappropriate)
	def self.table_name()
		"log"
	end

	# writes the logging message into the database (if the minimal logging level is met)
	def self.log(level, username, subject, text)
		# convert logging level from configuration
		config_level_text = APP_CONFIG["logging_level"].upcase
		config_level_number = map_log_level_to_number(config_level_text)

		# convert logging level from in-code caller
		in_code_level_number = map_log_level_to_number(level)

		# if the in code level is lower than or equals the log level from the configuration file,
		# then write the log message into the database!
		if in_code_level_number <= config_level_number
			self.create(:log_level => config_level_text, :user => username, :subject => subject, :text => text, :created_at => Time.now)
		end
	end

	# map log_level text to numerical values to be able,
	# to include levels such as "PRODUCTION" into other levels like "DEBUG"
	def self.map_log_level_to_number(level)
		# set default level to debug
		log_level = 2

		case level.upcase
		when "DEBUG"
			log_level = 2
		when "PRODUCTION"
			log_level= 1
		end

		return log_level
	end

end
