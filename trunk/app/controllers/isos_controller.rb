class IsosController < ApplicationController
	include ExtScaffold

	rescue_from ActiveRecord::RecordNotFound do |exception|
    render :nothing => true, :status => :not_found
  end

	# GET /hosts
  def index
    @hosts = Host.find(:all)

		respond_to do |format|
      format.xml { render :xml => @hosts }
      format.json { render :json => @hosts.to_ext_json }
    end
  end

  # GET /hosts/1
  def show
    @host = Host.find(params[:id])
		@host.update_mem_info

    respond_to do |format|
			format.xml { render :xml => @host }
			format.json { render :json => @host.to_ext_json }
		end
	end

	# GET /hosts/new
	def new
		@host = Host.new

		respond_to do |format|
			format.xml { render :xml => @host }
			format.json { render :json => @host.to_ext_json }
		end
	end

	# POST /hosts
	def create
		@iso = Iso.new
		

		@host = Host.new(params[:host])

		# pass params array to Host Model object
		# (needed for establishing libvirt connection)
		@host.current_user = @current_user

		respond_to do |format|
			if @host.save
				Dblogger.log("Production", @current_user.name, "Host", "Created Host #{@host.name} with id:#{@host.id}")
				format.xml { render :xml => @host, :status => :created }
				format.json { render :json => @host.to_ext_json, :status => :created }
			else
				format.xml { render :xml => @host.errors, :status => "422" }
				format.json { render :json => @host.errors.to_json, :status => "422" }
			end
		end
	end

	# PUT /hosts/1
	def update
		@host = Host.find(params[:id])

		# pass current_user.name to model
		@host.current_user = @current_user.name

		respond_to do |format|
			if @host.update_attributes(params[:host])
				Dblogger.log("Production", @current_user, "Host", "Updated Host #{@host.name} with id:#{@host.id}")
				format.xml { render :nothing => true, :status => :ok }
				format.json { render :nothing => true, :status => :ok }
			end
		end
	end

	# DELETE /hosts/1
	def destroy
		@host = Host.find(params[:id])

		host_id = @host.id
		host_name = @host.name
		@host.destroy

		Dblogger.log("Production", @current_user.name, "Host", "Deleted Host #{host_name} with id:#{host_id}")
		respond_to do |format|
			format.xml { render :nothing => true, :status => :ok }
			format.json { render :nothing => true, :status => :ok }
		end
	end
end
