require "connections_manager"

class HostsController < ApplicationController
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

	# PUT /hosts/init
	def init
		if APP_CONFIG["libvirt_integration"]
			@hosts = Host.find(:all, :conditions => {:connect => true} )

			puts "Re-establishing Connections..."

			# connect to all hosts with the connect attribute set to true
			@hosts.each do |host|
				host.establish_libvirt_connection
			end
		end
		
		respond_to do |format|
			format.xml { render :nothing => true, :status => :ok }
			format.json { render :nothing => true, :status => :ok }
		end
	end

	# GET /hosts/allvms
	def allvms

		respond_to do |format|
			# get all hosts
			@hosts = Host.find(:all, :order => :name)

			format.xml do
				require "xml/libxml"
				# create a new XML document
				doc = XML::Document.new()
				# create the root element
				doc.root = XML::Node.new("hosts")
				xmlhosts = doc.root

				# ExtJS needs unique ids for nodes, element_counter is used for that
				element_counter = 0;

				puts @hosts.length
				@hosts.each do |host|
					element_counter += 1;

					# create host element
					xmlhosts << xmlhost = XML::Node.new("host")
					# define host attributes
					xmlhost["id"] = element_counter.to_s
					xmlhost["host_id"] = host.id.to_s
					xmlhost["status"] = host.connected.to_s
					xmlhost["text"] = host.name.to_s
					xmlhost["hvm_support"] = host.hvm_support.to_s
					xmlhost["total_memory"] = host.total_memory.to_s
					xmlhost["lock_version"] = host.lock_version.to_s

					# only include VMs if host is connected
					if host.connected == true
						# iterate over all VMs belonging to a Host
						@vms = Vm.find(:all, :conditions => {:host_id => host.id }, :order => :name)
					
						if !@vms.blank?
							@vms.each do |vm|
								element_counter += 1;
							
								# refresh libvirt status for current VM
								vm.refresh_libvirt_status if APP_CONFIG["libvirt_integration"]
								xmlhost << xmlchildren = XML::Node.new("children")
								xmlchildren << xmlvm = XML::Node.new("vm")
								xmlvm["id"] = element_counter.to_s
								xmlvm["vm_id"] = vm.id.to_s
								xmlvm["text"] = vm.name.to_s
								xmlvm["type"] = vm.ostype.to_s
								xmlvm["status"] = vm.status.to_s
								xmlvm["lock_version"] = vm.lock_version.to_s
								xmlvm["leaf"] = "true"
							end
						else
							xmlhost["leaf"] = "true"
						end
					else
						xmlhost["leaf"] = "true"
					end
				end
				render :xml => doc
			end
      
			format.json do
				jsontree = "["

				# ExtJS needs unique ids for nodes, element_counter is used for that
				element_counter = 0;
				# iterate over all Hosts and build a Hash
				@hosts.each do |host|
					element_counter += 1;

					jsontree << "\n  { id: '#{element_counter}', host_id: '#{host.id}', status: '#{host.connected}', text: '#{host.name}', hvm_support: '#{host.hvm_support}', total_memory: '#{host.total_memory}', lock_version: '#{host.lock_version}', "

					# only include VMs if host is connected
					if host.connected == true
						# iterate over all VMs belonging to a Host
						@vms = Vm.find(:all, :conditions => {:host_id => host.id }, :order => :name)

						if !@vms.blank?

							jsontree << "\n    children: ["
							@vms.each do |vm|
								element_counter += 1;
							
								# refresh libvirt status for current VM
								vm.refresh_libvirt_status if APP_CONFIG["libvirt_integration"]
								jsontree << "{
                    id: '#{element_counter}',
                    vm_id: '#{vm.id}',
                    text: '#{vm.name}',
										type: '#{vm.ostype.to_s}',
										status: '#{vm.status}',
										lock_version: '#{vm.lock_version}',
                    leaf: true
                }"
								jsontree << "," if @vms.index(vm) < (@vms.length - 1)
								jsontree << "\n"
							end
							jsontree << "]"
						else
							jsontree << "leaf:true "
						end
					else
						jsontree << "leaf:true "
					end
					jsontree << "}"
					jsontree << "," if @hosts.index(host) < (@hosts.length - 1)
				end
				jsontree << "\n]";
				render :json => jsontree
			end
		end
	end

	# POST /hosts
	def create
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
				format.xml { render :xml => @host.errors, :status => :unprocessable_entity }
				format.json { render :json => @host.errors.to_json, :status => :unprocessable_entity}
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

#		connection = ConnectionsManager.instance
#		connection.remove(host_name)

		@host.destroy
		
		Dblogger.log("Production", @current_user.name, "Host", "Deleted Host #{host_name} with id:#{host_id}")
		respond_to do |format|
			format.xml { render :nothing => true, :status => :ok }
			format.json { render :nothing => true, :status => :ok }
		end
	end
end
