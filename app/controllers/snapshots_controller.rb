class SnapshotsController < ApplicationController
	include ExtScaffold

	rescue_from ActiveRecord::RecordNotFound do |exception|
    render :nothing => true, :status => :not_found
  end

	# GET /snapshots
  def index
    @snapshots = Snapshot.find(:all, :conditions => {:vm_id => params[:vm_id]} )

		respond_to do |format|
      format.xml { render :xml => @snapshots }
      format.json { render :json => @snapshots.to_ext_json }
    end
  end

  # GET /snapshots/1
  def show
    @snapshot = Snapshot.find(params[:id])

    respond_to do |format|
			format.xml { render :xml => @snapshot }
			format.json { render :json => @snapshot.to_ext_json }
		end
	end

	# GET /snapshots/new
	def new
		@snapshot = Snapshot.new

		respond_to do |format|
			format.xml { render :xml => @snapshot }
			format.json { render :json => @snapshot.to_ext_json }
		end
	end

	# POST /snapshots
	def create
		@snapshot = Snapshot.new(params[:snapshot])
		@snapshot.vm_id = params[:vm_id]

		respond_to do |format|
			if @snapshot.save && (!@snapshot.not_enough_space)
				Dblogger.log("Production", @current_user.name, "Snapshot", "Created Snapshot #{@snapshot.name} with id:#{@snapshot.id}")
				format.xml { render :xml => @snapshot, :status => :created }
				format.json { render :json => @snapshot.to_ext_json, :status => :created }
			elsif @snapshot.not_enough_space
				Dblogger.log("Production", @current_user.name, "Snapshot", "Could not create Snapshot #{@snapshot.name} with id:#{@snapshot.id} and Params:#{params[:Snapshot]}. Reason: Not enough space!")
        format.xml { render :nothing => true, :status => :request_entity_too_large }
				format.json { render :nothing => true, :status => :request_entity_too_large }
			else
				format.xml { render :xml => @snapshot.errors, :status => :unprocessable_entity }
				format.json { render :json => @snapshot.errors.to_json, :status => :unprocessable_entity }
			end
		end
	end

	# PUT /snapshots/1
	def update
		@snapshot = Snapshot.find(params[:id], :conditions => {:vm_id => params[:vm_id]})

		respond_to do |format|
			if @snapshot.update_attributes(params[:snapshot])
				#Dblogger.log("Production", @current_user, "Host", "Updated Host #{@host.name} with id:#{@host.id}")
				format.xml { render :nothing => true, :status => :ok }
				format.json { render :nothing => true, :status => :ok }
			end
		end
	end

	# DELETE /snapshots/1
	def destroy
		@snapshot = Snapshot.find(params[:id])

		@snapshot.destroy

		#Dblogger.log("Production", @current_user.name, "Host", "Deleted Host #{host_name} with id:#{host_id}")
		respond_to do |format|
			format.xml { render :nothing => true, :status => :ok }
			format.json { render :nothing => true, :status => :ok }
		end
	end
end
