
SnapshotTab = function(){

      // IsoTab record definition
	this.snapshotRecord = Ext.data.Record.create([
        {name: 'id', mapping: 'snapshot.id'},
        {name: 'name', mapping: 'snapshot.name'},
        {name: 'size', mapping: 'snapshot.size'},
        {name: 'description', mapping: 'snapshot.description'},
        {name: 'status', mapping: 'snapshot.status'},
        {name: 'date', mapping: 'snapshot.created_at'},
	]);
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
            {header: 'Name', dataIndex: 'name', width: 200},
            {header: 'Description', dataIndex: 'description', id: 'description'},
            {header: 'Date', dataIndex: 'date'},
            {header: 'Size [GB]', dataIndex: 'size'},
            {header: 'Status', dataIndex: 'status'}
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
			handler: this.deleteSnapshot
		}],
        items: [
            //myTabPanel.mySnapshotTab.snapshotToolbar,
            snapshotGrid
        ]
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
                    jsonData: {'snapshot':{'description': description }},
                    success: function(response){
                        console.log(response);
                        //var jsonResponse = Ext.util.JSON.decode(response.responseText);
                        //snapshotId = jsonResponse.data['snapshot[id]'];
                        //console.log(snapshotId);
                        //console.log(jsonResponse);
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
		Ext.Msg.alert('No ISO File Selected', 'Please select the Snapshot you want to delete');
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

SnapshotTab.prototype.checkSnapshotStatus = function(){
    Ext.Ajax.request({
        url: Util.prototype.BASEURL + 'hosts/' + hostTree.parentNodeId + '/vms/' + hostTree.selectedNodeId + '/snapshots/',
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        success: function(response){
            var jsonResponse = Ext.util.JSON.decode(response.responseText);
            status = jsonResponse.data['snapshot[status]'];
            if(status == 'creating'){
                setTimeout('VM.checkVmStatus(' + vmId + ',' + hostId + ')', 30000);
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


