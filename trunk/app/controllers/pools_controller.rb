require "constants"

class PoolsController < ApplicationController

	include ExtScaffold

	rescue_from ActiveRecord::RecordNotFound do |exception|
    render :nothing => true, :status => :not_found
  end

  # GET /pools
  def index
    @host = Host.find(params[:host_id])
    @pools = Pool.find(:all, :conditions => {:host_id => params[:host_id]})

    respond_to do |format|
      format.xml { render :xml => @pools }
			format.json { render :json => @pools.to_ext_json }
    end

 end

  # GET /pools/1
  def show
    @pool = Pool.find(params[:id], :conditions => {:host_id => params[:host_id]})
		@pool.update_pool_info
		@pool.save

    respond_to do |format|
      format.xml { render :xml => @pool }
			format.json { render :json => @pool.to_ext_json }
    end
  end

  # GET /pools/new
  def new
    @pool = Pool.new(:host_id => params[:host_id])

    respond_to do |format|
      format.xml { render :xml => @pool }
			format.json { render :json => @pool.to_ext_json }
    end
  end

  # POST /pools
  def create
		# create a new pool object
    @pool = Pool.new(params[:pool])
    @pool.host_id = params[:host_id]

    respond_to do |format|
      if @pool.save
				Dblogger.log("Debug", @current_user.name, "Pool", "Created Pool #{@pool.name} with id:#{@pool.id} and Params:#{params[:pool]}")
        format.xml { render :xml => @pool, :status => :created }
				format.json { render :json => @pool.to_ext_json, :status => :created }
      else
        format.xml { render :xml => @pool.errors, :status => :unprocessable_entity }
				format.json { render :json => @pool.errors.to_json, :status => :unprocessable_entity }
      end
    end
  end

  # PUT /pools/1
  def update
    @pool = Pool.find(params[:id], :conditions => {:host_id => params[:host_id]})

    respond_to do |format|
      if @pool.update_attributes(params[:pool])
				Dblogger.log("Debug", @current_user.name, "Pool", "Updated Pool #{@pool.name} with id:#{@pool.id} and Params:#{params[:pool]}")
        format.xml { render :nothing => true, :status => :ok }
				format.json { render :nothing => true, :status => :ok }
      end
    end
  end

  # DELETE /pools/1
  def destroy
    @pool = Pool.find(params[:id])

		pool_id = @pool.id
		pool_name = @pool.name
    @pool.destroy

		Dblogger.log("Debug", @current_user.name, "Pool", "Deleted Pool #{pool_name} with id:#{pool_id}")
    respond_to do |format|
      format.xml { render :nothing => true, :status => :ok }
			format.json { render :nothing => true, :status => :ok }
    end
  end
end
