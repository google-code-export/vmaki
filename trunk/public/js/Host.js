/*
 * Host constructor
 */

function Host(){

}

/*
 * class attributes
 */

// host record model
Host.prototype.hostRecord = Ext.data.Record.create([
    { name: 'id',  mapping: 'host.id' },
    { name: 'connect', mapping: 'host.connect' },
    { name: 'connected', mapping: 'host.connected' },
    { name: 'name', mapping: 'host.name' },
    { name: 'connection_type', mapping: 'host.connection_type' },
    { name: 'username', mapping: 'host.username' },
    { name: 'password', mapping: 'host.password' },
    { name: 'lock_version', mapping: 'host.lock_version' }
]);


// simplestore for connectin dropdown menu
Host.prototype.connectionStore = new Ext.data.SimpleStore({
    fields: ['id', 'connection'],
    data : [['1','xen+ssh://']]
});


/*
 * class methods
 */

// function to add new host which calls the add host request and add pool request
Host.addHost = function() {

    // mask when host is created
    hostMask = new Ext.LoadMask(Ext.getBody(), {
        msg: 'Host is being connected...'
    })

    // form to create new host
    Host.prototype.hostForm = new Ext.FormPanel({
        frame: true,
        autoHeight: true,
        autoWidth: true,
        bodyStyle: 'padding:10px;',
        monitorValid: true,
        items: [{
            xtype: 'radio',
            name: 'connect',
            checked: true,
            hidden: true,
            hideLabel: true
        },{
            xtype: 'textfield',
            fieldLabel: 'Host Name',
            name: 'name',
            allowBlank: false,
            width: 140
        },  
        new Ext.ux.SelectBox({
            name: 'connection_type',
            fieldLabel: 'Connection',
            mode: 'local',
            triggerAction: 'all',
            store: Host.prototype.connectionStore,
            displayField:'connection',
            allowBlank: false,
            editable: false,
            value: 'xen+ssh://',
            disabled: true,
            width: 140
        }),{
            xtype: 'textfield',
            fieldLabel: 'User',
            name: 'username',
            allowBlank: false,
            width: 140
        },{
            xtype: 'textfield',
            inputType: 'password',
            fieldLabel: 'Password',
            name: 'password',
            allowBlank: false,
            width: 140
        }]
    });

    // form to create pool
    Host.prototype.poolForm = new Ext.FormPanel({
        frame: true,
        autoHeight: true,
        autoWidth: true,
        bodyStyle: 'padding:10px;',
        monitorValid: true,
        items: [{
            xtype: 'textfield',
            fieldLabel: 'LVM Pool Name',
            name: 'name',
            allowBlank: false,
            width: 140
        }],
        // button to add host and pool
        buttons: [{
            text: 'Add',
            handler: Host.addHostRequest,
            formBind: true
        },{
            text: 'Cancel',
            handler: function(){
                Host.prototype.addHostWindow.close();
            }
        }]
    });

    // window which contains the host form and pool form
    Host.prototype.addHostWindow = new Ext.Window({
        layout: 'fit',
        id: 'addHostWindow',
        title: 'Add Host System',
        width: 300,
        resizable: false,
        draggable: false,
        listeners:{
            show: function(panel){
                Util.prototype.spot.show(panel.id);
            },
            close: function(panel){
                Util.prototype.spot.hide();              
            }
        },
        items: [
        Host.prototype.hostForm,
        Host.prototype.poolForm
        ]
    });
    // render window
    Host.prototype.addHostWindow.show();

}


// Request to add new Host
Host.addHostRequest = function(){

    // creates new record and passes values from the form into it
    var newHostRecord = new Host.prototype.hostRecord({});
    Host.prototype.hostForm.getForm().updateRecord(newHostRecord);

    // Encode Record into a json String
    var jsonString = Ext.util.JSON.encode(newHostRecord.data);
    // add the Root Element to the json String
    jsonString = Util.prependRoot('host', jsonString);

    // Load Mask
    var myMask = new Ext.LoadMask(Ext.getBody(), {
        msg:"Please wait...Host " + Host.prototype.hostForm.getForm().findField('name').getValue()  + "is being connected"
    });

    // POST Request
    Ext.Ajax.request({
        url: Util.prototype.BASEURL + 'hosts.json',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        timeout: 60000,
        jsonData: jsonString,
        success: function(response) {
            // gets the response text and decodes the json string to a object
            var jsonString = Ext.util.JSON.decode(response.responseText);
            // triggers the add pool request with the id of the generated host
            Pool.addPoolRequest(jsonString.data["host[id]"]);
            hostTree.rootNode.reload();
            hostMask.hide();
        },
        failure: function(response){
            Failure.checkFailure(response, Failure.prototype.hostAdd);
            hostMask.hide();
        }
    });

    //closes the add host window
    Host.prototype.addHostWindow.close();
    hostMask.show();

}


// function to connect a host
Host.connectHost = function(){
    Ext.Ajax.request({
        url: Util.prototype.BASEURL + 'hosts/' + hostTree.selectedNodeId,
        method: 'PUT',
        jsonData: {"host":{ "lock_version": hostTree.selectedNode.attributes.lock_version ,"connect": true }},
        failure: function(response){
            Failure.checkFailure(response, Failure.prototype.hostConnect);
        }
    })
    //reloades the tree
    hostTree.rootNode.reload();
}


// function to disconnect a host
Host.disconnectHost = function(){
    Ext.Ajax.request({
        url: Util.prototype.BASEURL + 'hosts/' + hostTree.selectedNodeId,
        method: 'PUT',
        jsonData: {"host":{ "lock_version": hostTree.selectedNode.attributes.lock_version , "connect": false}},
        failure: function(response){
            Failure.checkFailure(response, Failure.prototype.hostDisconnect);
        }
    })
    //reloades the tree
    hostTree.rootNode.reload();
}

// function to remove a host
Host.removeHost = function(){
    Ext.Msg.show({
        title: 'Remove Host',
        buttons: Ext.MessageBox.YESNO,
        msg: 'Are you sure you want to remove ' + '<b>' + hostTree.selectedNodeName + '</b> ?',
        fn: function(btn){
            if (btn == 'yes'){
                Ext.Ajax.request({
                    url: Util.prototype.BASEURL + 'hosts/' + hostTree.selectedNodeId,
                    method: 'DELETE',
                    failure: function(response){
                        Failure.checkFailure(response, Failure.prototype.hostRemove);
                    }
                })
                //reloades the tree
                hostTree.rootNode.reload();
            }
        }
    })

}


/*
* Pool constructor
*/

function Pool(){

}

/*
 * class attributes
 */

// Pool record definition
Pool.prototype.poolRecord = Ext.data.Record.create([
{
    name: 'id',
    mapping: 'pool.id'
},
{
    name: 'name',
    mapping: 'pool.name'
},
{
    name: 'host-id',
    mapping: 'pool.host-id'
}
]);




/*
* class methods
 */


Pool.addPoolRequest = function(hostId){

    // creates a new pool record and passes the values of the pool form into it
    var newPoolRecord = new Pool.prototype.poolRecord({});
    Host.prototype.poolForm.getForm().updateRecord(newPoolRecord);

    // encodes the record into a json string
    var jsonString = Ext.util.JSON.encode(newPoolRecord.data);
    // prepends the roor element to the json string
    jsonString = Util.prependRoot('pool', jsonString);

    // request to create the pool
    Ext.Ajax.request({
        url: Util.prototype.BASEURL + 'hosts/' + hostId + '/pools',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        jsonData: jsonString,
        failure: function(response){
            hostMask.hide();
            Failure.checkFailure(response, Failure.prototype.poolAdd);
            Ext.Ajax.request({
                url: Util.prototype.BASEURL + 'hosts/' + hostId,
                method: 'DELETE',
                success: function(){
                    //reloades the tree
                    setTimeout('hostTree.rootNode.reload()', 2000);
                }
            })
 
        }
    });
}







               
			