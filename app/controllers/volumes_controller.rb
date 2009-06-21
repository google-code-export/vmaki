class VolumesController < ApplicationController

	include ExtScaffold

	rescue_from ActiveRecord::RecordNotFound do |exception|
		render :nothing => true, :status => :not_found
  end

  # GET /volumes
  def index
    @volumes = Volume.find(:all, :conditions => {:pool_id => params[:pool_id]})

    respond_to do |format|
      format.xml { render :xml => @volumes }
			format.json { render :json => @volumes.to_ext_json }
    end
  end

  # GET /volumes/1
  def show
    @volume = Volume.find(params[:id], :conditions => {:pool_id => params[:pool_id]})

    respond_to do |format|
      format.xml { render :xml => @volume }
			format.json { render :json => @volume.to_ext_json }
    end
  end

  # GET /volumes/new
  def new
    @volume = Volume.new(:pool_id => params[:pool_id])

    respond_to do |format|
      format.xml { render :xml => @volume }
			format.json { render :json => @volume.to_ext_json }
    end
  end
   
  # POST /volumes
  def create
    @volume = Volume.new(params[:volume])
    @volume.pool_id = params[:pool_id]

    respond_to do |format|
      if @volume.save && (!@volume.not_enough_space)
				Dblogger.log("Debug", @current_user.name, "Volume", "Created Volume #{@volume.name} with id:#{@volume.id} and Params:#{params[:volume]}")
        format.xml { render :xml => @volume, :status => :created }
				format.json { render :json => @volume, :status => :created }
			elsif @volume.not_enough_space
				Dblogger.log("Production", @current_user.name, "Volume", "Could not create Volume #{@volume.name} with id:#{@volume.id} and Params:#{params[:volume]}. Reason: Not enough space!")
        format.xml { render :nothing => true, :status => :request_entity_too_large }
				format.json { render :nothing => true, :status => :request_entity_too_large }
      else
        format.xml { render :xml => @volume.errors, :status =>	:unprocessable_entity }
				format.json { render :json => @volume.errors.to_json, :status => :unprocessable_entity }
      end
    end
  end

  # PUT /volumes/1
  def update
    @volume = Volume.find(params[:id], :conditions => {:pool_id => params[:pool_id]})

    respond_to do |format|
      if @volume.update_attributes(params[:volume]) && (!@volume.not_enough_space)
				Dblogger.log("Debug", @current_user.name, "Volume", "Updated Volume #{@volume.name} with id:#{@volume.id} and Params:#{params[:volume]}")
        format.xml { render :nothing => true, :status => :ok }
				format.json { render :nothing => true, :status => :ok }
			elsif @volume.not_enough_space
				Dblogger.log("Production", @current_user.name, "Volume", "Could not grow Volume #{@volume.name} with id:#{@volume.id} and Params:#{params[:volume]}. Reason: Not enough space!")
        format.xml { render :nothing => true, :status => :request_entity_too_large }
				format.json { render :nothing => true, :status => :request_entity_too_large }
      end
    end
  end

  def destroy
    @volume = Volume.find(params[:id])

		volume_id = @volume.id
		volume_name = @volume.name
    @volume.destroy

		Dblogger.log("Debug", @current_user.name, "Volume", "Deleted Volume #{volume_name} with id:#{volume_id}")
    respond_to do |format|
      format.xml { render :nothing => true, :status => :ok }
			format.json { render :nothing => true, :status => :ok }
    end
  end
end
