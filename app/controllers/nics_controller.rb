class NicsController < ApplicationController
	include ExtScaffold

	rescue_from ActiveRecord::RecordNotFound do |exception|
    render :nothing => true, :status => :not_found
  end

	# GET /nics
  def index
    @host = Host.find(params[:host_id])
    @nics = Nic.find(:all, :conditions => {:host_id => params[:host_id]})

    respond_to do |format|
      format.xml { render :xml => @nics }
			format.json { render :json => @nics.to_ext_json }
    end

	end

  # GET /nics/1
  def show
    @nics = Nic.find(params[:id], :conditions => {:host_id => params[:host_id]})

    respond_to do |format|
      format.xml { render :xml => @nics }
			format.json { render :json => @nics.to_ext_json }
    end
  end

end
