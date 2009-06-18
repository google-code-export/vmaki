
SnapshotTab = function(){

    // IsoTab record definition
    this.snapshotRecord = Ext.data.Record.create([
    {
        name: 'id',
        mapping: 'snapshot.id'
    },

    {
        name: 'name',
        mapping: 'snapshot.name'
    },

    {
        name: 'size',
        mapping: 'snapshot.size'
    },

    {
        name: 'description',
        mapping: 'snapshot.description'
    },

    {
        name: 'status',
        mapping: 'snapshot.status'
    },

    {
        name: 'date',
        mapping: 'snapshot.created_at'
    },
    ]);
}


// example of custom renderer function
function renderStatus(val){
    if(val == 'creating'){
        return '<span style="color:red;">' + val + '</span>';
    }
    else{
        return '<span style="color:green;">' + val + '</span>';
    }
    return val;
}

SnapshotTab.prototype.getStore = function(panel){



    // snapshot store
    snapshotStore = new Ext.data.JsonStore({
        url: Util.prototype.BASEURL + 'hosts/' + hostTree.parentNodeId + '/vms/' + hostTree.selectedNodeId + '/snapshots.json',
        root: 'snapshots',
        fields: myTabPanel.mySnapshotTab.snapshotRecord
    });
    snapshotStore.load();

    // iso grid panel
    snapshotGrid = new Ext.grid.GridPanel({
        border: false,
        autoHeight: true,
        autoWidth: true,
        minColumnWidth: 100,
        store: snapshotStore,
        //tbar: myTabPanel.mySnapshotTab.snapshotToolbar,
        autoExpandColumn: 'description',
        columns:[
        {
            header: 'Name',
            dataIndex: 'name',
            width: 200
        },

        {
            header: 'Description',
            dataIndex: 'description',
            id: 'description'
        },

        {
            header: 'Date',
            dataIndex: 'date'
        },

        {
            header: 'Size [GB]',
            dataIndex: 'size'
        },

        {
            header: 'Status',
            dataIndex: 'status',
            renderer: renderStatus
        }
        ]
    })
    
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
            icon: 'images/icons/camera_stop.gif',
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
    
    panel.doLayout();
}

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
                    jsonData: {
                        'snapshot':{
                            'description': description
                        }
                        },
                    success: function(response){
                        var jsonResponse = Ext.util.JSON.decode(response.responseText);
                        snapshotId = jsonResponse.data['snapshot[id]'];
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
    // window which contains rename user form
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
    addSnapshotWindow.show();
}

SnapshotTab.prototype.deleteSnapshot = function(){
    // gets the selected iso file
    var sm = snapshotGrid.getSelectionModel();
    var sel = sm.getSelected();
    // checks if a iso file is selected
    if(sm.hasSelection()){
        Ext.Msg.show({
            title: 'Remove ISO File',
            buttons: Ext.MessageBox.YESNO,
            msg: 'Are you sure you want to delete snapshot <b>' + sel.data.name + '</b>?',
            fn: function(btn){
                if (btn == 'yes'){
                    Ext.Ajax.request({
                        url: Util.prototype.BASEURL + 'hosts/' + hostTree.parentNodeId + '/vms/' + hostTree.selectedNodeId + '/snapshots/' + sel.data.id,
                        method: 'DELETE',
                        failure: function(response){
                            Failure.checkFailure(response, Failure.prototype.snapshotDelete);
                        }
                    })
                    snapshotStore.reload();
                    snapshotStore.removeAll();
                }
            }
        })
    }
    else{
        // message which is shown if no user is selected
        Ext.Msg.alert('No Snapshot Selected', 'Please select the Snapshot you want to delete');
    }
}

SnapshotTab.prototype.restoreSnapshot = function(){
    // gets the selected iso file
    var sm = snapshotGrid.getSelectionModel();
    var sel = sm.getSelected();
    
    if(hostTree.selectedNode.attributes.status == 'running' || hostTree.selectedNode.attributes.status == 'blocked' || hostTree.selectedNode.attributes.status == 'nostate'){
        Ext.Msg.alert('VM Running', 'VM must be shut down in order to restore the snapshot! ');
    }

    // checks if a iso file is selected
    else if(sm.hasSelection()){
        Ext.Msg.show({
            title: 'Remove ISO File',
            buttons: Ext.MessageBox.YESNO,
            msg: 'Are you sure you want to restore snapshot <b>' + sel.data.name + '</b>?',
            fn: function(btn){
                if (btn == 'yes'){
                    Ext.Ajax.request({
                        url: Util.prototype.BASEURL + 'hosts/' + hostTree.parentNodeId + '/vms/' + hostTree.selectedNodeId + '/snapshots/' + sel.data.id,
                        method: 'PUT',
                        jsonData: {
                            'snapshot':{
                                'restore': true
                            }
                            },
                        success: function(){
                            hostTree.rootNode.reload();
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
        // message which is shown if no user is selected
        Ext.Msg.alert('No Snapshot Selected', 'Please select the Snapshot you want to restore');
    }
}

SnapshotTab.prototype.renameSnapshot = function(){

    // gets the selected user
    var sm = snapshotGrid.getSelectionModel();
    var sel = sm.getSelected();
    // checks if a user is selectd
    if(sm.hasSelection()){
        console.log(sel.data.id);
        //form to rename iso
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
                        jsonData: {
                            'snapshot':{
                                'description': description
                            }
                            },
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
        // window which contains rename iso form
        var renameSnapshotWindow = new Ext.Window({
            layout: 'fit',
            title: 'Enter new Description and Filename',
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
        // message which is shown if no iso is selected
        Ext.Msg.alert('No Snapshot Selected', 'Please select the ISO File you want to rename');
    }
}

SnapshotTab.prototype.noVmSelected = function(panel){
    panel.add(new Ext.Panel({
        border: false,
        id: 'snapshot',
        cls: 'console-panel',
        html: '<div class="console-error">No VM selected - In order to manage Snapshots you must select a VM</div>'
    }))
    panel.doLayout();
}

SnapshotTab.prototype.checkSnapshotStatus = function(snapshotId){
    Ext.Ajax.request({
        url: Util.prototype.BASEURL + 'hosts/' + hostTree.parentNodeId + '/vms/' + hostTree.selectedNodeId + '/snapshots/' + snapshotId + '.json',
        method: 'GET',
        headers: { 
            'Content-Type': 'application/json'
        },
        success: function(response){
            var jsonResponse = Ext.util.JSON.decode(response.responseText);
            status = jsonResponse.data['snapshot[status]'];
            if(status == 'creating'){
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






