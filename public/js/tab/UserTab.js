/*
 * UserTab constructor
 */

function UserTab(){
    // toolbar
    this.userToolbar = new Ext.Toolbar({
        items:[{
            xtype: 'tbbutton',
            cls: 'x-btn-text-icon',
            icon: 'images/icons/user_add.gif',
            text: 'Add User',
            handler: this.addUser
        },{
            xtype: 'tbbutton',
            cls: 'x-btn-text-icon',
            icon: 'images/icons/user_cross.gif',
            text: 'Delete User',
            handler: this.deleteHandler
        },{
            xtype: 'tbbutton',
            cls: 'x-btn-text-icon',
            icon: 'images/icons/user_edit.gif',
            text: 'Rename User',
            handler: this.renameHandler
        },{
            xtype: 'tbbutton',
            cls: 'x-btn-text-icon',
            icon: 'images/icons/user_key.gif',
            text: 'Reset Password',
            handler: this.resetHandler
        }]
    })

    // User record definition
    this.userRecord = Ext.data.Record.create([
        {name: 'id', mapping: 'user.id'},
        {name: 'name', mapping: 'user.name'},
        {name: 'password', mapping: 'user.password'},
        {name: 'role', mapping: 'user.role'},
        {name: 'lock_version', mapping: 'user.lock_version'}
    ]);

    // user store
    this.userStore = new Ext.data.JsonStore({
        url: Util.prototype.BASEURL + 'users.json',
        root: 'users',
        fields: this.userRecord
    });

    // user grid panel
    this.userGrid = new Ext.grid.GridPanel({
        border: false,
        autoHeight: true,
        autoWidth: true,
        minColumnWidth: 35,
        store: this.userStore,
        tbar: this.userToolbar,
		//{header: 'ID', dataIndex: 'id'},
        columns:[
            {header: 'Username', dataIndex: 'name'},
            {header: 'Role', dataIndex: 'role'}
        ]
    })

    //load data into user store
    this.userStore.load();

}


/*
* object methods
*/

// user delete handler
UserTab.prototype.deleteHandler = function(){
    // gets the selected user
    var sm = myUser.userGrid.getSelectionModel();
    var sel = sm.getSelected();
    // checks if a user is selected
    if(sm.hasSelection()){
        Ext.Msg.show({
            title: 'Remove User',
            buttons: Ext.MessageBox.YESNO,
            msg: 'Are you sure you want to delete user <b>' + sel.data.name + '</b>?',
            fn: function(btn){
                if (btn == 'yes'){
                    // calls the delete user function with the user id
                    myUser.deleteUser(sel.data.id);
                }
            }
        })
    }
    else{
        // message which is shown if no user is selected
        Ext.Msg.alert('No User Selected', 'Please select the user you want to delete');
    }
}

// user rename handler
UserTab.prototype.renameHandler = function(){
    // gets the selected user
    var sm = myUser.userGrid.getSelectionModel();
    var sel = sm.getSelected();
    // checks if a user is selectd
    if(sm.hasSelection()){
        // calls function with selected user id
        myUser.renameUser(sel.data.id, sel.data.lock_version);
    }
    else{
        // message which is shown if no user is selected
        Ext.Msg.alert('No User Selected', 'Please select the user you want to rename');
    }       
}

// password reset handler
UserTab.prototype.resetHandler = function(){
    // gets the selected user
    var sm = myUser.userGrid.getSelectionModel();
    var sel = sm.getSelected();
    // chechs if a user is selected
    if(sm.hasSelection()){
        // calls function with selected user id
        myUser.resetPassword(sel.data.id, sel.data.lock_version);
    }
    else{
        // message which is shown if no user is selected
        Ext.Msg.alert('No User Selected', 'Please select the user you want to reset the password for');
    }
}

// add user function
UserTab.prototype.addUser = function() {

    // simplestore for dropdown menu
    var role = new Ext.data.SimpleStore({
        fields: ['id', 'role'],
        data : [['1', 'Administrator'],['2', 'User']]
    });

    // form to create new user
    var userForm = new Ext.FormPanel({
        frame: true,
        autoHeight: true,
        autoWidth: true,
        bodyStyle: 'padding:10px;',
        monitorValid: true,
        items: [{
            xtype: 'textfield',
            fieldLabel: 'Name',
            name: 'name',
            allowBlank: false,
            width: 160
        },{
            xtype: 'combo',
            name: 'role',
            fieldLabel: 'Role',
            triggerAction: 'all',
            mode: 'local',
            store: role,
            displayField:'role',
            editable: false,
            allowBlank: false,
            width: 160
        },{
            xtype: 'textfield',
            inputType: 'password',
            fieldLabel: 'Password',
            name: 'password',
            allowBlank: false,
            width: 160
        }],
        buttons: [{
            text: 'Add',
            formBind: true,
            handler: function(){
                // creates new user record which will be filled with the form data
                var newUserRecord = new myUser.userRecord({});
                userForm.getForm().updateRecord(newUserRecord);
                // encodes the record data into json format
                var jsonString = Ext.util.JSON.encode(newUserRecord.data);
                // prepend root element to the json string
                jsonString = Util.prependRoot('"user"', jsonString);
                // sends request to the server
                Ext.Ajax.request({
                    url: Util.prototype.BASEURL + 'users.json',
                    method: 'POST',
                    jsonData: jsonString,
                    failure: function(response){
                        Failure.checkFailure(response, Failure.prototype.userAdd);
                    }
                })
                // closes the window and reloads the user store data
                addUserWindow.close();
                myUser.userStore.reload();
            }
        },{
            text: 'Cancel',
            handler: function(){
                addUserWindow.close();
            }
        }]
    });

    // Create new Window and add render hostForm to it
    var addUserWindow = new Ext.Window({
        layout: 'fit',
        title: 'Add User',
        resizable: false,
        draggable: false,
        width: 330,
        items: userForm,
        listeners:{
                show: function(panel){
                    Util.prototype.spot.show(panel.id);
                },
                close: function(panel){
                    Util.prototype.spot.hide();
                }
            }
    });
    // show window
    addUserWindow.show();
}

// delete user function
UserTab.prototype.deleteUser = function(id){
    Ext.Ajax.request({
        url: Util.prototype.BASEURL + 'users/' + id,
        method: 'DELETE',
        failure: function(response){
            Failure.checkFailure(response, Failure.prototype.userDelete);
        }
    })
    myUser.userStore.reload();
}

// rename user function
UserTab.prototype.renameUser = function(id, lockVersion){

    //form to rename user
    var renameUserForm = new Ext.FormPanel({
        frame: true,
        autoHeight: true,
        autoWidth: true,
        bodyStyle: 'padding:10px;',
        items: [
        {
            xtype: 'textfield',
            fieldLabel: 'Username',
            name: 'username',
            width: 160,
            allowBlank: false
        }],
        buttons: [{
            text: 'Rename',
            bindForm: true,
            handler: function(){
                // gets the value out of the form
                var username = renameUserForm.getForm().findField('username').getValue();
                // sends request to the server
                Ext.Ajax.request({
                    url: Util.prototype.BASEURL + 'users/' + id,
                    method: 'PUT',
                    jsonData: {'user':{'name': username, 'lock_version':  lockVersion}},
                    failure: function(response){
                        Failure.checkFailure(response, Failure.prototype.userRename);
                    }
                });
                // closes window and reloads the store
                renameUserWindow.close();
                myUser.userStore.reload();
            }
        },{
            text: 'Cancel',
            handler: function(){
                 renameUserWindow.close();
            }
        }]
    });
    // window which contains rename user form
    var renameUserWindow = new Ext.Window({
        layout: 'fit',
        title: 'Enter new User Name',
        resizable: false,
        draggable: false,
        width: 330,
        items: renameUserForm,
        listeners:{
                show: function(panel){
                    Util.prototype.spot.show(panel.id);
                },
                close: function(panel){
                    Util.prototype.spot.hide();
                }
            },
    });
    renameUserWindow.show();
}

// reset password function
UserTab.prototype.resetPassword = function(id, lockVersion){
    // form to reset password
    var resetPasswordForm = new Ext.FormPanel({
        frame: true,
        autoHeight: true,
        autoWidth: true,
        bodyStyle: 'padding:10px;',
        monitorValid: true,
        items: [{
            xtype: 'textfield',
            inputType: 'password',
            fieldLabel: 'Enter',
            name: 'password',
            width: 160,
            allowBlank: false
        },{
            xtype: 'textfield',
            inputType: 'password',
            fieldLabel: 'Confirm',
            name: 'conf_password',
            width: 160,
            allowBlank: false
        }],
        buttons: [{
            text: 'Reset Password',
            bindForm: true,
            handler: function(){
                // gets the values from the fields
                var password = resetPasswordForm.getForm().findField('password').getValue();
                var confirmedPassword = resetPasswordForm.getForm().findField('conf_password').getValue();
                // checks if passwords match and sends the request if so
                if(password == confirmedPassword){
                    Ext.Ajax.request({
                        url: Util.prototype.BASEURL + 'users/' + id,
                        method: 'PUT',
                        jsonData: {
                            'user':{
                                'password': password,
                                'lock_version':  lockVersion
                            }
                        },
                        failure: function(response){
                            Failure.checkFailure(response, Failure.prototype.passwordReset);
                    }
                    });
                    resetPasswordWindow.close();
                }
                else{
                    // message if passwords don't match
                    Ext.Msg.alert('','Passwords do not match, try again');
                    resetPasswordForm.getForm().reset();
                }
            }
        },{
            text: 'Cancel',
            handler: function(){
                resetPasswordWindow.close();
            }
        }]
    });
    // window which contains the reset password form
    var resetPasswordWindow = new Ext.Window({
        layout: 'fit',
        title: 'Enter new Password',
        resizable: false,
        draggable: false,
        width: 330,
        items: resetPasswordForm,
        listeners:{
                show: function(panel){
                    Util.prototype.spot.show(panel.id);
                },
                close: function(panel){
                    Util.prototype.spot.hide();
                }
            }
    });
    resetPasswordWindow.show();
}
