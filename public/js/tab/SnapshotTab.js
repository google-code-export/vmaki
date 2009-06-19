/*
 * UserTab constructor
 */


SnapshotTab = function(){

    // SnapshotTab record definition
    this.snapshotRecord = Ext.data.Record.create([
        {name: 'id', mapping: 'snapshot.id'},
        {name: 'name', mapping: 'snapshot.name'},
        {name: 'size', mapping: 'snapshot.size'},
        {name: 'description', mapping: 'snapshot.description'},
        {name: 'status', mapping: 'snapshot.status'},
        {name: 'date', mapping: 'snapshot.display_date'},
    ]);

}


//function to render status of the snapshot
function renderStatus(val){
    if(val == 'creating'){
        return '<span style="color:red;">' + val + '</span>';
    }
    else if(val == 'restoring'){
        return '<span style="color:red;">' + val + '</span>';
    }
    else{
        return '<span style="color:green;">' + val + '</span>';
    }
    return val;
}


// function to load the data store of the selected vm and display it in the Tabpanel
SnapshotTab.prototype.getStore = function(panel){

    // snapshot store
    snapshotStore = new Ext.data.JsonStore({
        url: Util.prototype.BASEURL + 'hosts/' + hostTree.parentNodeId + '/vms/' + hostTree.selectedNodeId + '/snapshots.json',
        root: 'snapshots',
        fields: myTabPanel.mySnapshotTab.snapshotRecord
    });
    //initial load of the data store
    snapshotStore.load();


    // snapshot grid panel
    snapshotGrid = new Ext.grid.GridPanel({
        border: false,
        autoHeight: true,
        autoWidth: true,
        minColumnWidth: 100,
        store: snapshotStore,
        autoExpandColumn: 'description',
        columns:[
            {header: 'Name', dataIndex: 'name', width: 200},
            {header: 'Description', dataIndex: 'description', id: 'description'},
            {header: 'Date', dataIndex: 'date'},
            {header: 'Size [GB]', dataIndex: 'size'},
            {header: 'Status', dataIndex: 'status', renderer: renderStatus}
        ]
    })

    // adds the snapshot grid to the snapshot tab panel
    panel.add(new Ext.Panel({
        layout: 'fit',
        border: false,
        id: 'snapshot',
        tbar: [{
            xtype: 'tbbutton',
            cls: 'x-btn-text-icon',
            icon: 'images/icons/camera_add.gif',
            text: 'Add Snapshot',
            handler: this.addSnapshot
        },{
            xtype: 'tbbutton',
            cls: 'x-btn-text-icon',
            icon: 'images/icons/camera_delete.gif',
            text: 'Delete Snapshot',
            handler: this.deleteSnapshot
        },{
            xtype: 'tbbutton',
            cls: 'x-btn-text-icon',
            icon: 'images/icons/camera_go.png',
            text: 'Restore Snapshot',
            handler: this.restoreSnapshot
        },{
            xtype: 'tbbutton',
            cls: 'x-btn-text-icon',
            icon: 'images/icons/camera_edit.gif',
            text: 'Rename Snapshot',
            handler: this.renameSnapshot
        }],
        items: snapshotGrid
        
    }))
    // render tab panel
    panel.doLayout();
}


// function to create a snapshot of the selected vm
SnapshotTab.prototype.addSnapshot = function(){

    //form to add snapshot
    addSnapshotForm = new Ext.FormPanel({
        frame: true,
        autoHeight: true,
        autoWidth: true,
        bodyStyle: 'padding:10px;',
        items: [{
             xtype: 'label',
             height: 30,
             cls: 'label',
             html: '<p>Creating Snapshot for VM <b>' + hostTree.selectedNode.attributes.text + '</b></p>'
        },{
             xtype: 'label',
             text: ' '
        },{
            xtype: 'textfield',
            id: 'description',
            fieldLabel: 'Description',
            name: 'decription',
            width: 280,
            allowBlank: false
        }],
        buttons: [{
            text: 'Add',
            bindForm: true,
            handler: function(){
                // gets the value out of the form
                var description = addSnapshotForm.getForm().findField('description').getValue();
                // sends request to the server
                Ext.Ajax.request({
                    url: Util.prototype.BASEURL + 'hosts/' + hostTree.parentNodeId + '/vms/' + hostTree.selectedNodeId + '/snapshots.json',
                    method: 'POST',
                    jsonData: {'snapshot':{'description': description}},
                    success: function(response){
                        var jsonResponse = Ext.util.JSON.decode(response.responseText);
                        snapshotId = jsonResponse.data['snapshot[id]'];
                        // calls snapshot check function
                        myTabPanel.mySnapshotTab.checkSnapshotStatus(snapshotId);
                    },
                    failure: function(response){
                        Failure.checkFailure(response, Failure.prototype.snapshotAdd);
                    }
                });
                // closes window and reloads the store
                addSnapshotWindow.close();
                snapshotStore.reload();
            }
        },{
            text: 'Cancel',
            handler: function(){
                addSnapshotWindow.close();
            }
        }]
    });
    // window which contains add snapshot form
    addSnapshotWindow = new Ext.Window({
        layout: 'fit',
        title: 'Enter Snapshot Description',
        resizable: false,
        draggable: false,
        width: 450,
        items: addSnapshotForm,
        listeners:{
            show: function(panel){
                Util.prototype.spot.show(panel.id);
            },
            close: function(panel){
                Util.prototype.spot.hide();
            }
        }
    });
    // display add snapshot window
    addSnapshotWindow.show();
}


// function to delete selected snapshot
SnapshotTab.prototype.deleteSnapshot = function(){
    // gets the selected snaphot
    var sm = snapshotGrid.getSelectionModel();
    var sel = sm.getSelected();
    // checks if a snapshot is selected
    if(sm.hasSelection()){
        Ext.Msg.show({
            title: 'Delete Snapshot',
            buttons: Ext.MessageBox.YESNO,
            msg: 'Are you sure you want to delete snapshot <b>' + sel.data.name + '</b>?',
            fn: function(btn){
                if (btn == 'yes'){
                    Ext.Ajax.request({
                        url: Util.prototype.BASEURL + 'hosts/' + hostTree.parentNodeId + '/vms/' + hostTree.selectedNodeId + '/snapshots/' + sel.data.id,
                        method: 'DELETE',
                        success: function(response){
                            snapshotStore.reload();
                            snapshotStore.removeAll();
                        },
                        failure: function(response){
                            Failure.checkFailure(response, Failure.prototype.snapshotDelete);
                        }
                    })
                }
            }
        })
    }
    else{
        // message which is shown if no snapshot is selected
        Ext.Msg.alert('No Snapshot Selected', 'Please select the Snapshot you want to delete');
    }
}


// function to restore snapshot
SnapshotTab.prototype.restoreSnapshot = function(){
    // gets the selected snapshot
    var sm = snapshotGrid.getSelectionModel();
    var sel = sm.getSelected();

    // checks if vm is runnig
    // if true error message is shown
    if(hostTree.selectedNode.attributes.status == 'running' || hostTree.selectedNode.attributes.status == 'blocked' || hostTree.selectedNode.attributes.status == 'nostate'){
        Ext.Msg.alert('VM Running', 'VM must be shut down in order to restore the snapshot! ');
    }

    // checks if a snapshot is selected
    else if(sm.hasSelection()){
        Ext.Msg.show({
            title: 'Restore Snapshot',
            buttons: Ext.MessageBox.YESNO,
            msg: 'Are you sure you want to restore snapshot <b>' + sel.data.name + '</b>?',
            fn: function(btn){
                if (btn == 'yes'){
                    Ext.Ajax.request({
                        url: Util.prototype.BASEURL + 'hosts/' + hostTree.parentNodeId + '/vms/' + hostTree.selectedNodeId + '/snapshots/' + sel.data.id,
                        method: 'PUT',
                        jsonData: {'snapshot':{'restore': true}},
                        success: function(){
                            hostTree.rootNode.reload();
                            snapshotStore.reload();
                        },
                        failure: function(response){
                            Failure.checkFailure(response, Failure.prototype.snapshotDelete);
                        }
                    })
                }
            }
        })
    }
    else{
        // message which is shown if no snapshot is selected
        Ext.Msg.alert('No Snapshot Selected', 'Please select the Snapshot you want to restore');
    }
}


// function to change the description of the snapshot
SnapshotTab.prototype.renameSnapshot = function(){

    // gets the selected selected
    var sm = snapshotGrid.getSelectionModel();
    var sel = sm.getSelected();

    // checks if a snapshot is selectd
    if(sm.hasSelection()){
        //form to rename snapshot
        var renameSnapshotForm = new Ext.FormPanel({
            frame: true,
            autoHeight: true,
            autoWidth: true,
            bodyStyle: 'padding:10px;',
            items: [{
                xtype: 'textfield',
                fieldLabel: 'Description',
                name: 'description',
                width: 250,
                value: sel.data.description,
                allowBlank: false
            }],
            buttons: [{
                text: 'Rename',
                bindForm: true,
                handler: function(){
                    // gets the value out of the form
                    var description = renameSnapshotForm.getForm().findField('description').getValue();
                    // sends request to the server
                    Ext.Ajax.request({
                        url: Util.prototype.BASEURL + 'hosts/' + hostTree.parentNodeId + '/vms/' + hostTree.selectedNodeId + '/snapshots/' + sel.data.id,
                        method: 'PUT',
                        jsonData: {'snapshot':{'description': description}},
                        failure: function(response){
                            Failure.checkFailure(response, Failure.prototype.isoUpdate);
                        }
                    });
                    // closes window and reloads the store
                    renameSnapshotWindow.close();
                    snapshotStore.reload();
                }
            },{
                text: 'Cancel',
                handler: function(){
                    renameSnapshotWindow.close();
                }
            }]
        });
        // window which contains rename snapshot form
        var renameSnapshotWindow = new Ext.Window({
            layout: 'fit',
            title: 'Enter new Description',
            resizable: false,
            draggable: false,
            width: 430,
            items: renameSnapshotForm,
            listeners:{
                show: function(panel){
                    Util.prototype.spot.show(panel.id);
                },
                close: function(panel){
                    Util.prototype.spot.hide();
                }
            }
        });
        renameSnapshotWindow.show();


    }
    else{
        // message which is shown if no snapshot is selected
        Ext.Msg.alert('No Snapshot Selected', 'Please select the snapshot you want to rename');
    }
}


//function to set message to tab panel if no vm is selected
SnapshotTab.prototype.noVmSelected = function(panel){
    panel.add(new Ext.Panel({
        border: false,
        id: 'snapshot',
        cls: 'console-panel',
        html: '<div class="console-error">No VM selected - In order to manage Snapshots you must select a VM</div>'
    }))
    panel.doLayout();
}


//function to check the status of a newly created snapshot
SnapshotTab.prototype.checkSnapshotStatus = function(snapshotId){
    Ext.Ajax.request({
        url: Util.prototype.BASEURL + 'hosts/' + hostTree.parentNodeId + '/vms/' + hostTree.selectedNodeId + '/snapshots/' + snapshotId + '.json',
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
        success: function(response){
            var jsonResponse = Ext.util.JSON.decode(response.responseText);
            status = jsonResponse.data['snapshot[status]'];
            if(status == 'creating'){
                setTimeout('myTabPanel.mySnapshotTab.checkSnapshotStatus(' + snapshotId + ')', 30000);
            }
            else if(status == 'restoring'){
                setTimeout('myTabPanel.mySnapshotTab.checkSnapshotStatus(' + snapshotId + ')', 30000);
            }
            else{
                snapshotStore.reload();
            }
        },
        failure: function(response){
            Failure.checkFailure(response);
        }
    });
}






