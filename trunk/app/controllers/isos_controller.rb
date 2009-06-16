class IsosController < ApplicationController
	include ExtScaffold

	protect_from_forgery :only => [:destroy]

	rescue_from ActiveRecord::RecordNotFound do |exception|
    render :nothing => true, :status => :not_found
  end

	# GET /isos
  def index
    @isos = Iso.find(:all)

		respond_to do |format|
      format.xml { render :xml => @isos }
      format.json { render :json => @isos.to_ext_json }
    end
  end

  # GET /isos/1
  def show
    @iso = Iso.find(params[:id])

    respond_to do |format|
			format.xml { render :xml => @iso }
			format.json { render :json => @iso.to_ext_json }
		end
	end

	# GET /isos/new
	def new
		@iso = Iso.new
		
		respond_to do |format|
			format.xml { render :xml => @iso }
			format.json { render :json => @iso.to_ext_json }
		end
	end

	# POST /isos
	def create
		@iso = Iso.new(params[:iso])

		# test version
		@iso.filename = "test.iso"
		@iso.description = "just a test"
		@iso.size = 700
#		@iso.filename = params[:filename]
#		@iso.description = params[:description]
#		@iso.size = params[:size]
		#data = request.headers["iso_data"]
		#data.rewind

		#File.open("UPLOAD.txt","wb") do |file|
		#	file.write(data)
		#end


		respond_to do |format|
			if @iso.save
				#Dblogger.log("Production", @current_user.name, "Host", "Created Host #{@host.name} with id:#{@host.id}")
				format.xml { render :xml => @iso, :status => :created }
				format.json { render :json => @iso.to_ext_json, :status => :created }
			else
				format.xml { render :xml => @iso.errors, :status => "422" }
				format.json { render :json => @iso.errors.to_json, :status => "422" }
			end
		end
	end

	# PUT /isos/1
	def update
		@iso = Host.find(params[:id])

		respond_to do |format|
			if @iso.update_attributes(params[:iso])
				#Dblogger.log("Production", @current_user, "Host", "Updated Host #{@host.name} with id:#{@host.id}")
				format.xml { render :nothing => true, :status => :ok }
				format.json { render :nothing => true, :status => :ok }
			end
		end
	end

	# DELETE /isos/1
	def destroy
		@iso = Iso.find(params[:id])

		# check if a running VM has attached this ISO and if yes, cancel deletion!
		@vms = Vm.find(:all, :conditions => {:iso_id => params[:id]})
		statuses = Array.new
		@vms.each do |vm|
			statuses << vm.status
		end

		if statuses.any? { |status| status.include? "running" }
			respond_to do |format|
				format.xml { render :nothing => true, :status => :forbidden }
				format.json { render :nothing => true, :status => :forbidden }
			end

		else
			# looks like no running VM having this ISO attached could be found,
			# so set all corresponding iso_id references to NULL
			@vms.each do |vm|
				vm.iso_id = nil
				vm.save
			end

			@iso.destroy
		end

		#Dblogger.log("Production", @current_user.name, "Host", "Deleted Host #{host_name} with id:#{host_id}")
		respond_to do |format|
			format.xml { render :nothing => true, :status => :ok }
			format.json { render :nothing => true, :status => :ok }
		end
	end
end
