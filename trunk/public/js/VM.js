/*
 * VM constructor
 */

function VM(){

}

/*
 * class attributes
 */

// record model for vms
VM.prototype.vmRecord = Ext.data.Record.create([
    {name: 'id', mapping: 'vm.id'},
    {name: 'name', mapping: 'vm.name'},
    {name: 'host_id', mapping: 'vm.host_id'},
    {name: 'memory', mapping: 'vm.memory'},
    {name: 'vcpu', mapping: 'vm.vcpu'},
    {name: 'rootvolume_id', mapping: 'vm.rootvolume_id'},
    {name: 'swapvolume_id', mapping: 'vm.swapvolume_id'},
    {name: 'ostype', mapping: 'vm.ostype'},
    {name: 'bootloader', mapping: 'vm.bootloader'},
    {name: 'clockoffset', mapping: 'vm.clockoffset'},
    {name: 'current_status', mapping: 'vm.current_status'},
    {name: 'set_status', mapping: 'vm.set_status'},
    {name: 'max_memory', mapping: 'vm.max_memory'},
    {name: 'nic_id', mapping: 'vm.nic_id'},
    {name: 'cdrom', mapping: 'vm.cdrom'},
    {name: 'iso_id', mapping: 'vm.iso_id'},
]);

// simplestore for connection dropdown menu
VM.prototype.ostypeStore = new Ext.data.SimpleStore({
    fields: ['id', 'ostype'],
    data : [['1','PV'],['2', 'HVM']]
});




/*
* class methods
*/

// add vm function
// creates the form and displays it in the add vm window
// calls the add volumes request
VM.addVm = function(){

    // record model for the iso store
    isoRecord = Ext.data.Record.create([
        {name: 'id', mapping: 'iso.id'},
        {name: 'filename', mapping: 'iso.filename'}
    ])

    // json store for isos
    isoStore = new Ext.data.JsonStore({
        url: Util.prototype.BASEURL + 'isos.json',
        root: 'isos',
        fields: isoRecord,
        autoLoad: true
    });

    // record model for the nic store
    nicRecord = Ext.data.Record.create([
        {name: 'id', mapping: 'nic.id'},
        {name: 'name', mapping: 'nic.name'}
    ])

    // json store for nics
    nicStore = new Ext.data.JsonStore({
        url: Util.prototype.BASEURL + 'hosts/' + hostTree.selectedNodeId + '/nics.json',
        root: 'nics',
        fields: nicRecord,
        autoLoad: true
    });

    // mask when vm is created
    vmMask = new Ext.LoadMask(Ext.getBody(), {
        msg: 'VM is being created...'
    })

    // form to create new vm
    VM.prototype.vmForm = new Ext.FormPanel({
        frame: true,
        autoHeight: true,
        autoWidth: true,
        labelWidth: 200,
        bodyStyle: 'padding:10px;',
        monitorValid: true,
        items: [{
            xtype: 'fieldset',
            title: 'Settings',
            id: 'settings_fieldset',
            autoHeight: true,
            items: [{
                xtype: 'textfield',
                name: 'cdrom',
                hidden: true,
                hideLabel: true
            },{
                xtype: 'textfield',
                name: 'iso_id',
                hidden: true,
                hideLabel: true
            },{
                xtype: 'textfield',
                fieldLabel: 'Root Partion',
                name: 'rootvolume_id',
                hidden: true,
                hideLabel: true
            },{
                xtype: 'textfield',
                fieldLabel: 'Root Partion',
                name: 'swapvolume_id',
                hidden: true,
                hideLabel: true
            },{
                xtype: 'textfield',
                fieldLabel: 'VM Name',
                name: 'name',
                allowBlank: false,
                width: 100
            },
            new Ext.ux.SelectBox({
                name: 'ostype',
                id: 'ostypeSelect',
                fieldLabel: 'Type',
                mode: 'local',
                triggerAction: 'all',
                store: VM.prototype.ostypeStore,
                displayField:'ostype',
                allowBlank: false,
                selectOnFocus: true,
                editable: false,
                width: 80
            }),
            new Ext.ux.form.Spinner({
                name: 'memory',
                fieldLabel: 'Memory [MByte]',
                displayField:'memory',
                allowBlank: false,
                width: 80,
                value: 128,
                strategy: new Ext.ux.form.Spinner.NumberStrategy({
                    minValue:'128',
                    //maxValue: 2048,
                    incrementValue: 128
                })
            }),
            new Ext.ux.form.Spinner({
                name: 'vcpu',
                fieldLabel: 'VCPUs',
                displayField:'vcpu',
                allowBlank: false,
                width: 80,
                value: 1,
                strategy: new Ext.ux.form.Spinner.NumberStrategy({
                    minValue:'1',
                    maxValue:'2'
                })
            }),
            new Ext.ux.form.Spinner({
                name: 'root_capacity',
                fieldLabel: 'Root Partition Capacity [GByte]',
                displayField:'root_capacity',
                allowBlank: false,
                width: 80,
                value: 3.0,
                strategy: new Ext.ux.form.Spinner.NumberStrategy({
                    minValue:'2.0',
                    maxValue:'15.0',
                    incrementValue: 0.5
                })
            }),
            new Ext.ux.SelectBox({
                name: 'nic_id',
                fieldLabel: 'NIC',
                triggerAction: 'all',
                store: nicStore,
                displayField:'name',
                valueField: 'id',
                allowBlank: false,
                selectOnFocus: true,
                editable: false,
                width: 80
            })]
        },{
            xtype: 'fieldset',
            title: 'Media',
            id: 'media_fieldset',
            autoHeight: true,
            collapsible: true,
            collapsed: true,
            items:[{
                xtype: 'radio',
                id: 'cdrom_radio',
                hideLabel: true,
                boxLabel: 'CD-ROM',
                name: 'media',
                checked: true
            },{
                xtype: 'radio',
                id: 'iso_radio',
                hideLabel: true,
                boxLabel: 'ISO',
                name: 'media',
                listeners:{
                    check: function(checkbox, checked){
                        if(checked == true){
                            VM.prototype.vmForm.getComponent('media_fieldset').getComponent('iso').enable();
                        }
                        else{
                            VM.prototype.vmForm.getComponent('media_fieldset').getComponent('iso').disable();
                            VM.prototype.vmForm.getComponent('media_fieldset').getComponent('iso').reset();
                        }
                    }
                }
            },
            new Ext.ux.SelectBox({
                displayField:'filename',
                valueField: 'id',
                allowBlank: false,
                selectOnFocus: true,
                editable: false,
                name: 'iso_id',
                id: 'iso',
                disabled: 'true',
                hideLabel: true,
                triggerAction: 'all',
                store: isoStore,
                width: 200
            })]
        }],
        buttons: [{
            text: 'Add',
            formBind: true,
            // request to add root volume which if successful triggers swap volume request
            // which if successful triggers the add vm request
            handler: function(){
                Volume.addVolumes();
                vmMask.show();
                VM.prototype.addVmWindow.close();
            }
        },{
            text: 'Cancel',
            handler: function(){
                VM.prototype.addVmWindow.close();             
            }
        }]
    });

    // gets the selcted node
    var node = hostTree.getSelectedNode();

    // checks if node supports hvm
    // if not Type is set to PV and the select box disabled
    if(node.attributes.hvm_support == 'false'){
        VM.prototype.vmForm.getComponent('settings_fieldset').getComponent('ostypeSelect').setValue('PV');
        VM.prototype.vmForm.getComponent('settings_fieldset').getComponent('ostypeSelect').disable();
    }
    // checks if host is connencted
    // if not the add vm window is not shown and a message appears
    if(node.attributes.status == 'true'){
        // Create new Window and render vmForm to it
        VM.prototype.addVmWindow = new Ext.Window({
            layout: 'fit',
            id: 'addVmWindow',
            title: 'Add VM',
            resizable: false,
            draggable: false,
            width: 380,
            listeners:{
                show: function(panel){
                    // on show spot is activated
                    Util.prototype.spot.show(panel.id);
                },
                close: function(panel){
                    // on close spot is hidden
                    Util.prototype.spot.hide();
                }
            },
            items: [
                VM.prototype.vmForm
            ]
        });
        // shows window
        VM.prototype.addVmWindow.show();
    }
    else{
        // message shown if host is not connected
        Ext.Msg.alert('Host not Connected', 'Please connect the Host first');
    }
}


// add vm request
// which is called after root volume has successfully been created
VM.addVmRequest = function(){

    // gets the value of field ostype
    ostype = VM.prototype.vmForm.getForm().findField('ostype').getValue();
    // sets value of ostype filed to linux if PV
    if(ostype == 'PV'){
        VM.prototype.vmForm.getForm().findField('ostype').setValue('linux');
    }
    // sets value of ostype filed to linux if PV
    if(ostype == 'HVM'){
        VM.prototype.vmForm.getForm().findField('ostype').setValue('hvm');
    }

    // get media type and set the cdrom field corresponding to it
    if(VM.prototype.vmForm.getComponent('media_fieldset').getComponent('cdrom_radio').getValue() == true){
         VM.prototype.vmForm.getForm().findField('cdrom').setValue('phy');
    }
    if(VM.prototype.vmForm.getComponent('media_fieldset').getComponent('iso_radio').getValue() == true){
         VM.prototype.vmForm.getForm().findField('cdrom').setValue('iso');
         iso_id = VM.prototype.vmForm.getComponent('media_fieldset').getComponent('iso').getValue();
         VM.prototype.vmForm.getForm().findField('iso_id').setValue(iso_id);
    }

    // close the window
    VM.prototype.addVmWindow.close();

    // new vm redord which is filled with form data
    var newVmRecord = new VM.prototype.vmRecord({});
    VM.prototype.vmForm.getForm().updateRecord(newVmRecord);

    // encodes the string into json format
    var jsonString = Ext.util.JSON.encode(newVmRecord.data);
    // prepends the root element to the json string
    jsonString = Util.prependRoot('vm', jsonString);

    hostId = hostTree.selectedNodeId;

    // sends request to the server
    Ext.Ajax.request({
        url: Util.prototype.BASEURL + 'hosts/' + hostId + '/vms.json',
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        jsonData: jsonString,
        success: function(response) {
            // reloads tree
            hostTree.rootNode.reload();
            // checks if it is a PV VM
            if(ostype == 'PV'){
                var jsonResponse = Ext.util.JSON.decode(response.responseText);
                // calls getVmStatus with the corresponding vm id and host id
                VM.checkVmStatus(jsonResponse.data["vm[id]"], hostId);
            }
            // hides the mask
            vmMask.hide();

        },
        failure: function(response){
            Failure.checkFailure(response, Failure.prototype.vmAdd);
            // hides the mask
            vmMask.hide();
        }
    });
}


// checks the status of the vm
// if the status is provisioning it keeps looking until provisioning is finished
// afterwards the tree is reloaded and the icons correctly displayed
VM.checkVmStatus = function(vmId, hostId){
    Ext.Ajax.request({
        url: Util.prototype.BASEURL + 'hosts/' + hostId + '/vms/' + vmId + '.json',
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        success: function(response){
            var jsonResponse = Ext.util.JSON.decode(response.responseText);
            status = jsonResponse.data['vm[status]'];
            if(status == 'provisioning'){
                setTimeout('VM.checkVmStatus(' + vmId + ',' + hostId + ')', 30000);
            }
            else{
                hostTree.rootNode.reload();
            }
        },
        failure: function(response){
            Failure.checkFailure(response);
        }
    });
}


// function to delete vm
// calls the delete volume function
VM.deleteVM = function(){
    // gets the selcted node
    var node = hostTree.getSelectedNode();
    Ext.Msg.show({
        title: 'Delete VM',
        buttons: Ext.MessageBox.YESNO,
        icon: Ext.MessageBox.QUESTION,
        msg: 'Are you sure you want to delete VM ' + '<b>' + hostTree.selectedNodeName + '</b> ?',
        fn: function(btn){
            if (btn == 'yes'){
                // request to get the root and swap volume ids
                // if successfull the deleteVolume function is called
                Ext.Ajax.request({
                    url: Util.prototype.BASEURL + 'hosts/' + hostTree.parentNodeId + '/vms/' + hostTree.selectedNodeId + '.json',
                    method: 'GET',
                    success: function(response){
                        jsonResponse = Ext.util.JSON.decode(response.responseText);
                        swapvolumeId = jsonResponse.data['vm[swapvolume_id]'];
                        rootvolumeId = jsonResponse.data['vm[rootvolume_id]'];
                        VM.deleteVmRequest();
                        if (swapvolumeId){
                            Volume.deleteVolume(swapvolumeId);
                        }
                        Volume.deleteVolume(rootvolumeId);
                    },
                    failure: function(response){
                        Failure.checkFailure(response);
                    }
                })
            }
        }
    })
}

// delete vm request
VM.deleteVmRequest = function(){
    // DELETE Reqeust
    Ext.Ajax.request({
        url: Util.prototype.BASEURL + 'hosts/' + hostTree.parentNodeId + '/vms/' + hostTree.selectedNodeId,
        method: 'DELETE',
        success: function(){
            //console.log(hostTree.selectedNode.parentNode);
            //hostTree.selectedNode.parentNode.select();

            hostTree.selectedNode.unselect();
            hostTree.rootNode.reload();
            
        },
        failure: function(response){
            Failure.checkFailure(response, Failure.prototype.vmDelete);
        }
    })
}

// function to start the vm
VM.start = function(){
    // sends the start request to the server
    Ext.Ajax.request({
        url: Util.prototype.BASEURL + 'hosts/' + hostTree.parentNodeId + '/vms/' + hostTree.selectedNodeId,
        method: 'PUT',
        jsonData: '{vm: {"action": "start"}}',
        success: function(){
            // sets time of 5s to reload the tree
            setTimeout('hostTree.rootNode.reload();', 5000);
        },
        failure: function(response){
            Failure.checkFailure(response, Failure.prototype.vmStart);
        }
    })
}

// function to suspend a vm
VM.suspend = function(){
    Ext.Msg.show({
        title: 'Suspend VM',
        buttons: Ext.MessageBox.YESNO,
        icon: Ext.MessageBox.QUESTION,
        msg: 'Are you sure you want to suspend VM ' + '<b>' + hostTree.selectedNodeName + '</b> ?',
        fn: function(btn){
            if (btn == 'yes'){
                // sends the start request to the server
                Ext.Ajax.request({
                    url: Util.prototype.BASEURL + 'hosts/' + hostTree.parentNodeId + '/vms/' + hostTree.selectedNodeId,
                    method: 'PUT',
                    jsonData: '{vm: {"action": "suspend"}}',
                    success: function(){
                        setTimeout('hostTree.rootNode.reload();', 5000);
                    },
                    failure: function(response){
                        Failure.checkFailure(response, Failure.prototype.vmSuspend);
                    }
                })
            }
        }
    })
}

// function to resume a vm
VM.resume = function(){
    // sends the start request to the server
    Ext.Ajax.request({
        url: Util.prototype.BASEURL + 'hosts/' + hostTree.parentNodeId + '/vms/' + hostTree.selectedNodeId,
        method: 'PUT',
        jsonData: '{vm: {"action": "resume"}}',
        success: function(){
            setTimeout('hostTree.rootNode.reload();', 5000);
        },
        failure: function(response){
            Failure.checkFailure(response, Failure.prototype.vmResume);
        }
    })
}


// function to shutdown a vm
VM.shutdown = function(){
    Ext.Msg.show({
        title: 'Shut Down VM',
        buttons: Ext.MessageBox.YESNO,
        icon: Ext.MessageBox.QUESTION,
        msg: 'Are you sure you want to shut down VM ' + '<b>' + hostTree.selectedNodeName + '</b> ?',
        fn: function(btn){
            if (btn == 'yes'){
                // sends the start request to the server
                Ext.Ajax.request({
                    url: Util.prototype.BASEURL + 'hosts/' + hostTree.parentNodeId + '/vms/' + hostTree.selectedNodeId,
                    method: 'PUT',
                    jsonData: '{vm: {"action": "shutdown"}}',
                    success: function(){
                        setTimeout('hostTree.rootNode.reload();', 10000);
                    },
                    failure: function(response){
                        Failure.checkFailure(response, Failure.prototype.vmShutdown);
                    }
                })
            }
        }
    })
}


// function to reboot a vm
VM.reboot = function(){
    Ext.Msg.show({
        title: 'Reboot VM',
        buttons: Ext.MessageBox.YESNO,
        icon: Ext.MessageBox.QUESTION,
        msg: 'Are you sure you want to reboot VM ' + '<b>' + hostTree.selectedNodeName + '</b> ?',
        fn: function(btn){
            if (btn == 'yes'){
                // sends the start request to the server
                Ext.Ajax.request({
                    url: Util.prototype.BASEURL + 'hosts/' + hostTree.parentNodeId + '/vms/' + hostTree.selectedNodeId,
                    method: 'PUT',
                    jsonData: '{vm: {"action": "reboot"}}',
                    success: function(){
                        setTimeout('hostTree.rootNode.reload();', 10000);
                    },
                    failure: function(response){
                        Failure.checkFailure(response, Failure.prototype.vmReboot);
                    }
                })
            }
        }
    })
}


// function to kill a vm
VM.kill = function(){
    Ext.Msg.show({
        title: 'Kill VM',
        buttons: Ext.MessageBox.YESNO,
        icon: Ext.MessageBox.QUESTION,
        msg: 'Are you sure you want to kill VM ' + '<b>' + hostTree.selectedNodeName + '</b> ?',
        fn: function(btn){
            if (btn == 'yes'){
                // sends the start request to the server
                Ext.Ajax.request({
                    url: Util.prototype.BASEURL + 'hosts/' + hostTree.parentNodeId + '/vms/' + hostTree.selectedNodeId,
                    method: 'PUT',
                    jsonData: '{vm: {"action": "kill"}}',
                    success: function(){
                        hostTree.rootNode.reload();
                    },
                    failure: function(response){
                        Failure.checkFailure(response, Failure.prototype.vmKill);
                    }
                })
            }
        }
    })
}


// function to get the current config of the vm
VM.getConfig = function(){
    // checks if selected node is not a vm
    if(hostTree.selectedNodeType != 'vm'){
        Ext.Msg.alert('No VM Selected', 'Please select the VM you want to reconfigure');
    }
    // gets the config if selected node is a vm
    else{
        // request to get the pool id
        Ext.Ajax.request({
            url: Util.prototype.BASEURL + 'hosts/' + hostTree.parentNodeId + '/pools.json',
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
            success: function(response){
                var jsonResponse = Ext.util.JSON.decode(response.responseText);
                poolId = jsonResponse.pools[0].pool['id'];
            }
        })
        // request to get the vm configuration
        Ext.Ajax.request({
            url: Util.prototype.BASEURL + 'hosts/' + hostTree.parentNodeId + '/vms/' + hostTree.selectedNodeId + '.json',
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
            success: function(response){
                var jsonResponse = Ext.util.JSON.decode(response.responseText);
                // sets the vm attributes
                vmStatus = jsonResponse.data['vm[status]'];
                vmOstype = jsonResponse.data['vm[ostype]'];
                vmMemory = jsonResponse.data['vm[memory]'];
                vmMaxMemory = jsonResponse.data['vm[max_memory]'];
                vmVcpu = jsonResponse.data['vm[vcpu]'];
                vmBootDevice = jsonResponse.data['vm[boot_device]'];
                if(vmBootDevice == 'cdrom'){
                    vmBootDevice = 'CD-ROM';
                }
                if(vmBootDevice == 'hd'){
                    vmBootDevice = 'HD';
                }
                if(vmBootDevice == 'network'){
                    vmBootDevice = 'PXE';
                }
                vmNic = jsonResponse.data['vm[nic_id]'];
                rootVolumeId = jsonResponse.data['vm[rootvolume_id]'];

                // record model for the nic store
                nicRecord = Ext.data.Record.create([
                    {name: 'id', mapping: 'nic.id'},
                    {name: 'name', mapping: 'nic.name'}
                ])


                // json store for nics
                nicStore = new Ext.data.JsonStore({
                    url: Util.prototype.BASEURL + 'hosts/' + hostTree.parentNodeId + '/nics.json',
                    id: 'nic.id',
                    root: 'nics',
                    fields: nicRecord,
                    autoLoad: true,
                    listeners:{
                        load: function(store){
                            nicName = store.getById(vmNic).get('name');
                            // request to get root volume information
                            Ext.Ajax.request({
                                url: Util.prototype.BASEURL + 'hosts/' + hostTree.parentNodeId + '/pools/ ' + poolId + '/volumes/' + rootVolumeId + '.json',
                                method: 'GET',
                                headers: {'Content-Type': 'application/json'},
                                success: function(response){
                                    var jsonResponse = Ext.util.JSON.decode(response.responseText);
                                    volumeCapacity = jsonResponse.data['volume[capacity]'];

                                    if(hostTree.selectedNode.attributes.type == 'linux'){
                                        VM.pvReconfigure(poolId, rootVolumeId);
                                    }
                                    else{
                                        // calls the function to reconfigure the vm
                                        VM.reconfigure(poolId, rootVolumeId);
                                    }
                                }
                            })
                        }
                    }
                });                
            },
            failure: function(response){
                Failure.checkFailure(response);
            }
        })
    }
}


// function to reconfigure the vm which is triggered after the current config
// has been loaded by the get config function
VM.reconfigure = function(poolId, rootVolumeId){
    
    // simplestore for bootdevice dropdown menu
    bootDeviceStore = new Ext.data.SimpleStore({
        fields: ['id', 'bootDevice'],
        data : [['1','CD-ROM'],['2', 'HD'],['3','Network']]
    });

    // form to reconfigure vm
    VM.prototype.reconfigureForm = new Ext.FormPanel({
        frame: true,
        autoHeight: true,
        autoWidth: true,
        labelWidth: 200,
        bodyStyle: 'padding:10px;',
        monitorValid: true,
        items: [ new Ext.ux.form.Spinner({
            name: 'memory',
            id: 'memorySpinner',
            fieldLabel: 'Memory [MByte]',
            displayField:'memory',
            allowBlank: false,
            width: 80,
            value: vmMemory,
            strategy: new Ext.ux.form.Spinner.NumberStrategy({
                minValue:'128',
                //maxValue:'2048',
                incrementValue: 128
            })
        }),
        new Ext.ux.form.Spinner({
            name: 'vcpu',
            id: 'vcpuSpinner',
            fieldLabel: 'VCPUs',
            displayField:'vcpu',
            allowBlank: false,
            width: 80,
            value: vmVcpu,
            strategy: new Ext.ux.form.Spinner.NumberStrategy({
                minValue:'1',
                maxValue:'2'
            })
        }),
        new Ext.ux.form.Spinner({
            name: 'root_capacity',
            id: 'rootCapacitySpinner',
            fieldLabel: 'Root Partition Capacity [GByte]',
            displayField:'root_capacity',
            allowBlank: false,
            width: 80,
            value: volumeCapacity,
            strategy: new Ext.ux.form.Spinner.NumberStrategy({
                minValue:'2.0',
                maxValue:'15.0',
                incrementValue: 0.5
            })
        }),new Ext.ux.SelectBox({
            name: 'boot_device',
            id: 'bootDeviceSelect',
            fieldLabel: 'Boot Device',
            mode: 'local',
            triggerAction: 'all',
            store: bootDeviceStore,
            displayField:'bootDevice',
            value: vmBootDevice,
            allowBlank: false,
            editable: false,
            width: 80
        }),
        new Ext.ux.SelectBox({
            name: 'nic_id',
            id: 'nicSelect',
            fieldLabel: 'NIC',
            triggerAction: 'all',
            store: nicStore,
            displayField:'name',
            valueField: 'id',
            value: nicName,
            allowBlank: false,
            editable: false,
            width: 80
        }),
        ],
        buttons: [{
            text: 'Send',
            formBind: true,
            // request to add root volume which if successful triggers swap volume request
            // which if successful triggers the add vm request
            handler: function(){               
                // checks if memory has been changed and calls reconfigure memory request if so
                if(vmMemory != VM.prototype.reconfigureForm.getForm().findField('memory').getValue()){
                    VM.reconfigureMemoryRequest(VM.prototype.reconfigureForm.getForm().findField('memory').getValue());
                }
                // checks if vcpu has been changed and calls reconfigure vcpu request if so
                if(vmVcpu != VM.prototype.reconfigureForm.getForm().findField('vcpu').getValue()){
                    VM.reconfigureVcpuRequest(VM.prototype.reconfigureForm.getForm().findField('vcpu').getValue());
                }
                // checks if volume capacity has been changed and calls reconfigure volume capacity request if so
                if(volumeCapacity != VM.prototype.reconfigureForm.getForm().findField('root_capacity').getValue()){
                    // checks if volume has been decreased
                    if(volumeCapacity > VM.prototype.reconfigureForm.getForm().findField('root_capacity').getValue()){
                        Ext.Msg.show({
                            title: 'Caution',
                            buttons: Ext.MessageBox.YESNO,
                            icon: Ext.MessageBox.WARNING,
                            msg: 'Decreasing the volume capacity might cause data loss !<br />Are you sure you want to continue ?',
                            width: 300,
                            fn: function(btn){
                                if (btn == 'yes'){
                                    VM.reconfigureCapacityRequest(VM.prototype.reconfigureForm.getForm().findField('root_capacity').getValue(), poolId, rootVolumeId);
                                }
                            }
                        })
                    }
                    else{
                        VM.reconfigureCapacityRequest(VM.prototype.reconfigureForm.getForm().findField('root_capacity').getValue(), poolId, rootVolumeId);
                    }
                 }

                // checks if boot device has been changed and calls reconfigure boot device request if so
                if(vmBootDevice != VM.prototype.reconfigureForm.getForm().findField('boot_device').getValue() && hostTree.selectedNode.attributes.type == 'hvm'){
                    if(VM.prototype.reconfigureForm.getForm().findField('boot_device').getValue() == 'CD-ROM'){
                        vmBootDevice = 'cdrom';
                    }
                    if(VM.prototype.reconfigureForm.getForm().findField('boot_device').getValue() == 'HD'){
                        vmBootDevice = 'hd';
                    }
                    if(VM.prototype.reconfigureForm.getForm().findField('boot_device').getValue() == 'PXE'){
                        vmBootDevice = 'network';
                    }                 
                    VM.reconfigureBootDeviceRequest(vmBootDevice);
                }
                // checks if nic has changed and calls reconfigure nic request if so
                if(nicName != VM.prototype.reconfigureForm.getForm().findField('nic_id').getValue()){
                    VM.reconfigureNicRequest(VM.prototype.reconfigureForm.getForm().findField('nic_id').getValue());
                }
                 // closes reconfigure window
                 VM.prototype.reconfigureVmWindow.close();                          
            }
        },{
            text: 'Cancel',
            handler: function(){
                VM.prototype.reconfigureVmWindow.close();
            }
        }]
    });

    // gets the selcted node
    var node = hostTree.getSelectedNode();
    //checks if host is connencted
    if(node.attributes.status == 'running'){
        VM.prototype.reconfigureForm.getComponent('rootCapacitySpinner').disable();
        VM.prototype.reconfigureForm.getComponent('bootDeviceSelect').disable();
        VM.prototype.reconfigureForm.getComponent('nicSelect').disable();
    }
    if(node.attributes.status == 'blocked'){
        VM.prototype.reconfigureForm.getComponent('rootCapacitySpinner').disable();
        VM.prototype.reconfigureForm.getComponent('bootDeviceSelect').disable();
        VM.prototype.reconfigureForm.getComponent('nicSelect').disable();
    }
    if(node.attributes.status == 'nostate'){
        VM.prototype.reconfigureForm.getComponent('rootCapacitySpinner').disable();
        VM.prototype.reconfigureForm.getComponent('bootDeviceSelect').disable();
        VM.prototype.reconfigureForm.getComponent('nicSelect').disable();
    }
    // checks if node is a pv vm and disables the boot device
    if(node.attributes.type == 'linux'){
        VM.prototype.reconfigureForm.getComponent('bootDeviceSelect').disable();
    }
   
    // Create new Window and render vmForm to it
    VM.prototype.reconfigureVmWindow = new Ext.Window({
        layout: 'fit',
        title: 'Reconfigure VM',
        resizable: false,
        draggable: false,
        width: 350,
        listeners:{
            show: function(panel){
                Util.prototype.spot.show(panel.id);
            },
            close: function(panel){
                Util.prototype.spot.hide();
            }
        },
        items: [
            VM.prototype.reconfigureForm
        ]
    });
    VM.prototype.reconfigureVmWindow.show();
}


// function to reconfigure the vm which is triggered after the current config
// has been loaded by the get config function
VM.pvReconfigure = function(poolId, rootVolumeId){


    // form to reconfigure vm
    VM.prototype.reconfigureForm = new Ext.FormPanel({
        frame: true,
        autoHeight: true,
        autoWidth: true,
        labelWidth: 200,
        bodyStyle: 'padding:10px;',
        monitorValid: true,
        items: [ new Ext.ux.form.Spinner({
            name: 'memory',
            id: 'memorySpinner',
            fieldLabel: 'Memory [MByte]',
            displayField:'memory',
            allowBlank: false,
            width: 80,
            value: vmMemory,
            strategy: new Ext.ux.form.Spinner.NumberStrategy({
                minValue:'128',
                //maxValue:'2048',
                incrementValue: 128
            })
        }),
        new Ext.ux.form.Spinner({
            name: 'max_memory',
            id: 'maxMemSpinner',
            fieldLabel: 'Maximum Memory [MByte]',
            displayField:'max_memory',
            allowBlank: false,
            width: 80,
            value: vmMaxMemory,
            strategy: new Ext.ux.form.Spinner.NumberStrategy({
                minValue:'128',
                //maxValue:'2048',
                incrementValue: 128
            })
        }),
        new Ext.ux.form.Spinner({
            name: 'vcpu',
            id: 'vcpuSpinner',
            fieldLabel: 'VCPUs',
            displayField:'vcpu',
            allowBlank: false,
            width: 80,
            value: vmVcpu,
            strategy: new Ext.ux.form.Spinner.NumberStrategy({
                minValue:'1',
                maxValue:'2'
            })
        }),
        new Ext.ux.form.Spinner({
            name: 'root_capacity',
            id: 'rootCapacitySpinner',
            fieldLabel: 'Root Partition Capacity [GByte]',
            displayField:'root_capacity',
            allowBlank: false,
            width: 80,
            value: volumeCapacity,
            strategy: new Ext.ux.form.Spinner.NumberStrategy({
                minValue:'2.0',
                maxValue:'15.0',
                incrementValue: 0.5
            })
        }),
        new Ext.ux.SelectBox({
            name: 'nic_id',
            id: 'nicSelect',
            fieldLabel: 'NIC',
            triggerAction: 'all',
            store: nicStore,
            displayField:'name',
            valueField: 'id',
            value: nicName,
            allowBlank: false,
            editable: false,
            width: 80
        }),
        ],
        buttons: [{
            text: 'Send',
            formBind: true,
            // request to add root volume which if successful triggers swap volume request
            // which if successful triggers the add vm request
            handler: function(){
                // checks if memory has been changed and calls reconfigure memory request if so
                if(vmMemory != VM.prototype.reconfigureForm.getForm().findField('memory').getValue()){
                    VM.reconfigurePvMemoryRequest(VM.prototype.reconfigureForm.getForm().findField('memory').getValue(),VM.prototype.reconfigureForm.getForm().findField('max_memory').getValue());
                }
                if(vmMaxMemory != VM.prototype.reconfigureForm.getForm().findField('max_memory').getValue()){
                    VM.reconfigurePvMemoryRequest(VM.prototype.reconfigureForm.getForm().findField('memory').getValue(),VM.prototype.reconfigureForm.getForm().findField('max_memory').getValue());
                }

                // checks if vcpu has been changed and calls reconfigure vcpu request if so
                if(vmVcpu != VM.prototype.reconfigureForm.getForm().findField('vcpu').getValue()){
                    VM.reconfigureVcpuRequest(VM.prototype.reconfigureForm.getForm().findField('vcpu').getValue());
                }
                // checks if volume capacity has been changed and calls reconfigure volume capacity request if so
                if(volumeCapacity != VM.prototype.reconfigureForm.getForm().findField('root_capacity').getValue()){
                    // checks if volume has been decreased
                    if(volumeCapacity > VM.prototype.reconfigureForm.getForm().findField('root_capacity').getValue()){
                        Ext.Msg.show({
                            title: 'Caution',
                            buttons: Ext.MessageBox.YESNO,
                            icon: Ext.MessageBox.WARNING,
                            msg: 'Decreasing the volume capacity might cause data loss !<br />Are you sure you want to continue ?',
                            width: 300,
                            fn: function(btn){
                                if (btn == 'yes'){
                                    VM.reconfigureCapacityRequest(VM.prototype.reconfigureForm.getForm().findField('root_capacity').getValue(), poolId, rootVolumeId);
                                }
                            }
                        })
                    }
                    else{
                        VM.reconfigureCapacityRequest(VM.prototype.reconfigureForm.getForm().findField('root_capacity').getValue(), poolId, rootVolumeId);
                    }
                 }

               
                // checks if nic has changed and calls reconfigure nic request if so
                if(nicName != VM.prototype.reconfigureForm.getForm().findField('nic_id').getValue()){
                    VM.reconfigureNicRequest(VM.prototype.reconfigureForm.getForm().findField('nic_id').getValue());
                }
                 // closes reconfigure window
                 VM.prototype.reconfigureVmWindow.close();
            }
        },{
            text: 'Cancel',
            handler: function(){
                VM.prototype.reconfigureVmWindow.close();
            }
        }]
    });

    // gets the selcted node
    var node = hostTree.getSelectedNode();
    //checks if host is connencted
    if(node.attributes.status == 'running'){
        VM.prototype.reconfigureForm.getComponent('rootCapacitySpinner').disable();
        VM.prototype.reconfigureForm.getComponent('maxMemSpinner').disable();
        VM.prototype.reconfigureForm.getComponent('nicSelect').disable();
    }
    if(node.attributes.status == 'blocked'){
        VM.prototype.reconfigureForm.getComponent('rootCapacitySpinner').disable();
        VM.prototype.reconfigureForm.getComponent('maxMemSpinner').disable();
        VM.prototype.reconfigureForm.getComponent('nicSelect').disable();
    }
    if(node.attributes.status == 'nostate'){
        VM.prototype.reconfigureForm.getComponent('rootCapacitySpinner').disable();
        VM.prototype.reconfigureForm.getComponent('maxMemSpinner').disable();
        VM.prototype.reconfigureForm.getComponent('nicSelect').disable();
    }
    

    // Create new Window and render vmForm to it
    VM.prototype.reconfigureVmWindow = new Ext.Window({
        layout: 'fit',
        title: 'Reconfigure VM',
        resizable: false,
        draggable: false,
        width: 350,
        listeners:{
            show: function(panel){
                Util.prototype.spot.show(panel.id);
            },
            close: function(panel){
                Util.prototype.spot.hide();
            }
        },
        items: [
            VM.prototype.reconfigureForm
        ]
    });
    VM.prototype.reconfigureVmWindow.show();
}



// request to set new memory
VM.reconfigureMemoryRequest = function(newMemory){
            Ext.Ajax.request({
                url: Util.prototype.BASEURL + 'hosts/' + hostTree.parentNodeId + '/vms/' + hostTree.selectedNodeId + '.json',
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                jsonData: {vm: {'memory': newMemory}},
                success: function(){
                    hostTree.selectedNodeChange();
                },
                failure: function(response){
                    Failure.checkFailure(response, Failure.prototype.memoryReconfigure);
                }
            })
}

// request to set new memory
VM.reconfigurePvMemoryRequest = function(newMemory, newMaxMemory){
            Ext.Ajax.request({
                url: Util.prototype.BASEURL + 'hosts/' + hostTree.parentNodeId + '/vms/' + hostTree.selectedNodeId + '.json',
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                jsonData: {vm: {'memory': newMemory, 'max_memory': newMaxMemory}},
                success: function(){
                    hostTree.selectedNodeChange();
                },
                failure: function(response){
                    Failure.checkFailure(response, Failure.prototype.memoryReconfigure);
                }
            })
}

// request to set new vcpu
VM.reconfigureVcpuRequest = function(newVcpu){
    Ext.Ajax.request({
        url: Util.prototype.BASEURL + 'hosts/' + hostTree.parentNodeId + '/vms/' + hostTree.selectedNodeId + '.json',
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        jsonData: {vm: {'vcpu': newVcpu}},
        success: function(){
            hostTree.selectedNodeChange();
        },
        failure: function(response){
                Failure.checkFailure(response, Failure.prototype.vcpuReconfigure);
            }
    })
}

// request to set root volume capacity
VM.reconfigureCapacityRequest = function(newCapacity, poolId, rootVolumeId){
    Ext.Ajax.request({
        url: Util.prototype.BASEURL + 'hosts/' + hostTree.parentNodeId + '/pools/ ' + poolId + '/volumes/' + rootVolumeId + '.json',
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        jsonData: {volume: {'capacity': newCapacity}},
        success: function(){
            hostTree.selectedNodeChange();
        },
        failure: function(response){
                Failure.checkFailure(response, Failure.prototype.volumeReconfigure);
            }
    })
}

// request to set boot device
VM.reconfigureBootDeviceRequest = function(newBootDevice){
    Ext.Ajax.request({
        url: Util.prototype.BASEURL + 'hosts/' + hostTree.parentNodeId + '/vms/' + hostTree.selectedNodeId + '.json',
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        jsonData: {vm: {'boot_device': newBootDevice}},
        success: function(){
            hostTree.selectedNodeChange();
        },
        failure: function(response){
                Failure.checkFailure(response, Failure.prototype.bootdeviceReconfigure);
            }
    })
}

// request to set NIC
VM.reconfigureNicRequest = function(newNic){
    Ext.Ajax.request({
        url: Util.prototype.BASEURL + 'hosts/' + hostTree.parentNodeId + '/vms/' + hostTree.selectedNodeId + '.json',
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        jsonData: {vm: {'nic_id': newNic}},
        success: function(){
            hostTree.selectedNodeChange();
        },
        failure: function(response){
                Failure.checkFailure(response, Failure.prototype.nicReconfigure);
            }
    })
}

// function to change the Media which will be attached to the vm
VM.setMedia = function(){
    // checks if selected node is not a vm
    if(hostTree.selectedNodeType != 'vm'){
        Ext.Msg.alert('No VM Selected', 'Please select the VM you want to set the Media for');
    }
    // if a vm is selected
    else{
    // record model for the iso store
    var isoRecord = Ext.data.Record.create([
        {name: 'id', mapping: 'iso.id'},
        {name: 'filename', mapping: 'iso.filename'}
    ])

    // json store for isos
    var isoStore = new Ext.data.JsonStore({
        url: Util.prototype.BASEURL + 'isos.json',
        root: 'isos',
        fields: isoRecord,
        autoLoad: true
    });

    // form to set media for a vm
    VM.prototype.mediaForm = new Ext.FormPanel({
        frame: true,
        autoHeight: true,
        autoWidth: true,
        bodyStyle: 'padding:10px;',
        monitorValid: true,
            items:[{
                xtype: 'radio',
                id: 'cdrom_radio',
                fieldLabel: 'Media',
                boxLabel: 'CD-ROM',
                name: 'media'
            },{
                xtype: 'radio',
                id: 'iso_radio',
                labelSeparator: '',
                boxLabel: 'ISO',
                name: 'media',
                listeners:{
                    //fires when button is cheched or unchecked
                    check: function(checkbox, checked){
                        if(checked == true){
                            VM.prototype.mediaForm.getComponent('iso').enable();
                        }
                        else{
                            VM.prototype.mediaForm.getComponent('iso').disable();
                            VM.prototype.mediaForm.getComponent('iso').reset();
                        }
                    }
                }
            },
            new Ext.ux.SelectBox({
                displayField:'filename',
                valueField: 'id',
                allowBlank: false,
                selectOnFocus: true,
                editable: false,
                name: 'iso_id',
                id: 'iso',
                disabled: 'true',
                labelSeparator: '',
                triggerAction: 'all',
                store: isoStore,
                width: 200
        }),
//        {
//                xtype: 'radio',
//                labelSeparator: '',
//                boxLabel: 'NFS',
//                name: 'media',
//                listeners:{
//                    //fires when button is cheched or unchecked
//                    check: function(checkbox, checked){
//                        if(checked == true){
//                            VM.prototype.mediaForm.getComponent('nfs').enable();
//                        }
//                        else{
//                            VM.prototype.mediaForm.getComponent('nfs').disable();
//                            VM.prototype.mediaForm.getComponent('nfs').reset();
//                        }
//                    }
//                }
//            },{
//                xtype: 'textfield',
//                name: 'nfs',
//                id: 'nfs',
//                disabled: true,
//                labelSeparator: '',
//                width: 200
//            }
        ],
        buttons: [{
            text: 'Save',
            formBind: true,
            handler: VM.prototype.setMediaRequest
        },{
            text: 'Cancel',
            handler: function(){
                VM.prototype.vmMediaWindow.close();
            }
        }]
    });

    // Create new Window and add render mediaForm to it
    VM.prototype.vmMediaWindow = new Ext.Window({
        layout: 'fit',
        title: 'Attach Media',
        resizable: false,
        draggable: false,
        width: 360,
        items: VM.prototype.mediaForm,
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
    VM.prototype.vmMediaWindow.show();
}


// function to send request to change attached media
VM.prototype.setMediaRequest = function(){

    // get media type and set the cdrom field corresponding to it
    if(VM.prototype.mediaForm.getComponent('cdrom_radio').getValue() == true){
         media = 'phy';
         iso_id = '';
    }
    if(VM.prototype.mediaForm.getComponent('iso_radio').getValue() == true){
         media = 'iso';
         iso_id = VM.prototype.mediaForm.getComponent('iso').getValue();
    }

    // closes the window
    VM.prototype.vmMediaWindow.close();

    //ajax request to change attached media
    Ext.Ajax.request({
        url: Util.prototype.BASEURL + 'hosts/' + hostTree.parentNodeId + '/vms/' + hostTree.selectedNodeId + '.json',
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        jsonData: {vm: {'cdrom': media, 'iso_id': iso_id}},
        success: function(){
            hostTree.selectedNodeChange();
        },
        failure: function(response){
                Failure.checkFailure(response, Failure.prototype.mediaReconfigure);
            }
    })
}
}
