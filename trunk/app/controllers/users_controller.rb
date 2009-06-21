class UsersController < ApplicationController
	before_filter :needs_to_be_admin, :only => [:index, :create, :destroy]
	before_filter :needs_to_be_admin_or_owner, :only => [:show, :update]

	include ExtScaffold

	rescue_from ActiveRecord::RecordNotFound do |exception|
    render :nothing => true, :status => :not_found
  end

	# GET /users
  def index
		@users = User.find(:all)

		respond_to do |format|
			format.xml { render :xml => @users }
			format.json { render :json => @users.to_ext_json }
		end
  end

  # GET /users/1
  def show
    @user = User.find(params[:id])

    respond_to do |format|
      format.xml { render :xml => @user }
			format.json { render :json => @user.to_ext_json }
    end
  end

  # GET /users/new
  def new
    @user = User.new

    respond_to do |format|
      format.xml { render :xml => @user }
			format.json { render :json => @user.to_ext_json }
    end
  end

  # POST /users
  def create
    @user = User.new(params[:user])

		respond_to do |format|
      if @user.save
				Dblogger.log("Production", @current_user.name, "User", "Created User #{@user.name} with id:#{@user.id}")
        format.xml { render :xml => @user, :status => :created }
        format.json { render :json => @user.to_ext_json, :status => :created }
      else
        format.xml { render :xml => @user.errors, :status => :unprocessable_entity }
        format.json { render :json => @user.errors.to_json, :status =>:unprocessable_entity }
      end
    end
  end

  # PUT /users/1
  def update
    @user = User.find(params[:id])

    respond_to do |format|
      if @user.update_attributes(params[:user])
				Dblogger.log("Production", @current_user.name, "User", "Updated User #{@user.name} with id:#{@user.id}")
        format.xml { render :nothing => true, :status => :ok }
        format.json { render :nothing => true, :status => :ok }
      end
    end
  end

  # DELETE /users/1
  def destroy
    @user = User.find(params[:id])

		user_id = @user.id
		user_name = @user.name
    @user.destroy

		Dblogger.log("Production", @current_user.name, "User", "Deleted User #{user_name} with id:#{user_id}")
    respond_to do |format|
      format.xml { render :nothing => true, :status => :ok }
      format.json { render :nothing => true, :status => :ok }
    end
  end

end
