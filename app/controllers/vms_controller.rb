require 'constants'

class VmsController < ApplicationController
	include ExtScaffold

	rescue_from ActiveRecord::RecordNotFound do |exception|
    render :nothing => true, :status => :not_found
  end

	def index
		@host = Host.find(params[:host_id])
		@vms = Vm.find(:all, :conditions => {:host_id => params[:host_id]})

		if APP_CONFIG["libvirt_integration"]
			@vms.each do |vm|
				vm.refresh_libvirt_status
			end
		end
				
		respond_to do |format|
      format.xml { render :xml => @vms }
			format.json { render :json => @vms.to_ext_json }
    end
	end

	# GET /vms/1
  def show
    @vm = Vm.find(params[:id], :conditions => {:host_id => params[:host_id]})

		# if libvirt integration is enabled, retrieve libvirt status
		if APP_CONFIG["libvirt_integration"]
			refreshed_status = @vm.refresh_libvirt_status
		else
			# if libvirt integration is disabled, just return data from the database
			refreshed_status = true
		end

		if refreshed_status
			respond_to do |format|
				format.xml { render :xml => @vm }
				format.json { render :json => @vm.to_ext_json }
			end
		else
			respond_to do |format|
				format.xml { render :nothing => true, :status => :precondition_failed }
				format.json { render :nothing => true, :status => :precondition_failed }
			end
		end
  end

  # GET /vms/new
  def new
    @vm = Vm.new(:host_id => params[:host_id])

    respond_to do |format|
      format.xml { render :xml => @vm }
			format.json { render :json => @vm.to_ext_json }
    end
  end

	# POST /vms
  def create
    @vm = Vm.new(params[:vm])
    @vm.host_id = params[:host_id]
	
    respond_to do |format|
      if @vm.save
				Dblogger.log("Production", @current_user.name, "VM", "Created VM #{@vm.name} with id:#{@vm.id} and Params:#{params[:vm]}")
        format.xml { render :xml => @vm, :status => :created }
				format.json { render :json => @vm.to_ext_json, :status => :created }
      else
        format.xml { render :xml => @vm.errors, :status => "422" }
				format.json { render :json => @vm.errors.to_json, :status => "422" }
      end
    end
  end

  # PUT /vms/1
  def update
    @vm = Vm.find(params[:id], :conditions => {:host_id => params[:host_id]})

		@vm.current_user = @current_user

		if @vm.status == "provisioning"
			respond_to do |format|
				format.xml { render :nothing => true, :status => :conflict }
				format.json { render :nothing => true, :status => :conflict}
			end
		else
			begin
			respond_to do |format|
				if @vm.update_attributes(params[:vm])
					Dblogger.log("Production", @current_user.name, "VM", "Updated VM #{@vm.name} with id:#{@vm.id} and Params:#{params[:vm]}")
					format.xml { render :nothing => true, :status => :ok }
					format.json { render :nothing => true, :status => :ok }
				end
			end
			rescue
				respond_to do |format|
					Dblogger.log("Production", @current_user.name, "VM", "Could not update VM #{@vm.name} with id:#{@vm.id} and Params:#{params[:vm]}")
					format.xml { render :nothing => true, :status => :forbidden }
					format.json { render :nothing => true, :status => :forbidden }
			end
			end
		end
  end

  # DELETE /vms/1
  def destroy
    @vm = Vm.find(params[:id])
		if APP_CONFIG["libvirt_integration"]
			if @vm.status == Constants::VM_LIBVIRT_SHUTOFF
				# libvirt integration enabled and VM status is 'shutoff', so delete it (also gets undefined in Xen context)
				@vm.destroy
				Dblogger.log("Production", @current_user.name, "VM", "Deleted VM #{@vm.name} with id:#{@vm.id}")
				respond_to do |format|
					format.xml { render :nothing => true, :status => :ok }
					format.json { render :nothing => true, :status => :ok }
				end
			else
				# libvirt integration enabled, but VM status is NOT 'shutoff', so don't delete it!
				respond_to do |format|
					format.xml { render :nothing => true, :status => :precondition_failed }
					format.json { render :nothing => true, :status => :precondition_failed }
				end
			end
		else
			# libvirt integration disabled, so delete it right away without checking the status
			@vm.destroy
			respond_to do |format|
				format.xml { render :nothing => true, :status => :ok }
				format.json { render :nothing => true, :status => :ok }
			end
		end
  end
end
