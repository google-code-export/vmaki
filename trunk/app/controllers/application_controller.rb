class ApplicationController < ActionController::Base
  helper :all # include all helpers, all the time
  protect_from_forgery # See ActionController::RequestForgeryProtection for details

	before_filter :authenticate

  # Scrub sensitive parameters from your log
  # filter_parameter_logging :password

	private

	def authenticate
		# clean up old sessions first
		cleanup

		session_key = request.env["HTTP_SESSION_KEY"]
		session_temp = ActiveRecord::SessionStore::Session.find_by_session_id(session_key)
		if session_temp
			puts "Activated Session with SESSION_KEY: #{session_key}"
			user_id	= session_temp.data[:user_id]
			session_temp[:updated_at] = current_date_time

			session_temp.save
			@current_user = User.find(user_id)
		else
			respond_to do |format|
				format.xml { render :nothing => true, :status => :unauthorized }
				format.json { render :nothing => true, :status => :unauthorized }
			end
		end
	end

	# session cleanup: looks for sessions older than 30 minutes, which will be deleted
	def cleanup
		current_time = current_date_time

		puts current_time

		# delete all sessions that are older than 30 minutes
		ActiveRecord::Base.connection.execute("DELETE FROM sessions WHERE updated_at < '#{current_time}'")
	end

	def current_date_time
		# set current time to UTC without offset
		utc = DateTime.now.new_offset(0)

		# set current time to 30 minutes ago
		utc = utc - 30.minutes
		current_time = utc.strftime "%Y-%m-%d %H:%M:%S"
		
		return current_time
	end

	def needs_to_be_admin
		if @current_user.role != Constants::ADMINISTRATOR_ROLE
			respond_to do |format|
				format.xml { render :nothing => true, :status => :forbidden }
				format.json { render :nothing => true, :status => :forbidden }
			end
		end
	end

	def needs_to_be_admin_or_owner
		@user = User.find(params[:id])
		is_owner = true if @user.id == @current_user.id

		if (@current_user.role != Constants::ADMINISTRATOR_ROLE) && (!is_owner)
			respond_to do |format|
				format.xml { render :nothing => true, :status => :forbidden }
				format.json { render :nothing => true, :status => :forbidden }
			end
		end
	end
end
