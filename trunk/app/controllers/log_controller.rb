class LogController < ApplicationController
	before_filter :needs_to_be_admin, :only => [:destroy]

	include ExtScaffold

	rescue_from ActiveRecord::RecordNotFound do |exception|
    render :nothing => true, :status => :not_found
  end

  # GET /log
  def index
    @log = Dblogger.find(:all)

		respond_to do |format|
      format.xml { render :xml => @log }
      format.json { render :json => @log.to_ext_json }
    end
  end

	# DELETE /log
	def destroy
		Dblogger.delete_all

		respond_to do |format|
      format.xml { render :nothing => true, :status => :ok }
      format.json { render :nothing => true, :status => :ok }
    end
	end
end
