class SessionsController < ApplicationController
	skip_before_filter :authenticate
	before_filter :authenticate_http_basic
	
	def create

	end

	protected

	def authenticate_http_basic
		user = authenticate_with_http_basic { |username, password| User.authenticate(username, password) }
		if user
			session[:user_id] = user.id
			session_key = request.session_options[:id]
			puts "Session created with Key: #{session_key}"
			Dblogger.log("Debug", user.name, "Session", "Created Session with SESSION_KEY: #{session_key}")
			response.headers["Session_Key"] = session_key
			respond_to do |format|
				format.xml { render :nothing => true, :status => :ok }
				format.json { render :nothing => true, :status => :ok }
			end
		else
			Dblogger.log("Debug", user.name, "Session", "Authorization failed")
			respond_to do |format|
				format.xml { render :nothing => true, :status => :unauthorized }
				format.json { render :nothing => true, :status => :unauthorized }
			end
		end
	end

end