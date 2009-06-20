/*
 * Volume constructor
 */

function Volume(){

}

/*
 * class attributes
 */

// record model for volumes
Volume.prototype.volumeRecord =  Ext.data.Record.create([
    {name: 'id', mapping: 'volume.id'},
    {name: 'name', mapping: 'volume.name'},
    {name: 'pool_id', mapping: 'volume.pool_id'},
    {name: 'source_path', mapping: 'volume.source_path'},
    {name: 'capacity', mapping: 'volume.capacity'},
    {name: 'vol_type', mapping: 'volume.vol_type'},
    {name: 'mkfs', mapping: 'volume.mkfs'}
])


/*
 * class methods
 */

// add swap volume function
// this function is called by addVolumes function
Volume.addSwapVolumeRequest = function(poolId){
     // gets the value of the field name (adds _swap to the name)
     var name = VM.prototype.vmForm.getForm().findField('name').getValue() + '-swap';
     // sets the capacity of the swap volume (2 * RAM of VM)
     var capacity = (2 * VM.prototype.vmForm.getForm().findField('memory').getValue()) / 1024;
     // json string which is sent to the server to create the swap volume
     jsonString = '{volume: {"name": "' + name + '", "vol_type": "swap", "mkfs": true, "capacity": ' + capacity + '}}';
     Ext.Ajax.request({
        url: Util.prototype.BASEURL + 'hosts/' + hostTree.selectedNodeId + '/pools/' + poolId + '/volumes.json',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        jsonData: jsonString,
        success: function(response){
            // gets the id of the created volume
            var jsonResponse = Ext.util.JSON.decode(response.responseText);
            volume_id = jsonResponse.volume['id'];
            // sets the id of the root volume in the add vm form
            VM.prototype.vmForm.getForm().findField('swapvolume_id').setValue(volume_id);
            // calls the add root volume function
            Volume.addRootVolumeRequest(poolId, volume_id);
        },
        failure: function(response){
            Failure.checkFailure(response, Failure.prototype.swapVolumeAdd);
            vmMask.hide();
        }
    });
    
}

// add root volume request
Volume.addRootVolumeRequest = function(poolId, swapVolumeId){
     // gets the values of the fields name (adds -root to the name) and root capacity of the add vm form
     var name = VM.prototype.vmForm.getForm().findField('name').getValue() + '-root';
     var capacity = VM.prototype.vmForm.getForm().findField('root_capacity').getValue();
     var mkfs = false;
     ostype = VM.prototype.vmForm.getForm().findField('ostype').getValue();
     if (ostype == 'PV'){
         mkfs = true;
     }
     // json string which is sent to the server to create the root volume
     var jsonString = '{volume: {"name": "' + name + '", "vol_type": "root", "mkfs": ' + mkfs + ', "capacity": ' + capacity + '}}';
     // request sent to the server to create the root volume
     Ext.Ajax.request({
        url: Util.prototype.BASEURL + 'hosts/' + hostTree.selectedNodeId + '/pools/' + poolId + '/volumes.json',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        jsonData: jsonString,
        success: function(response){
            // gets the id of the created volume
            var jsonResponse = Ext.util.JSON.decode(response.responseText);
            volumeId = jsonResponse.volume['id'];
            // sets the id of the root volume in the add vm form
            VM.prototype.vmForm.getForm().findField('rootvolume_id').setValue(volumeId);
            // calls the add vm request function
            VM.addVmRequest(poolId, volumeId, swapVolumeId);
            
        },
        failure: function(response){
            Volume.deleteVolume(swapVolumeId);
            Failure.checkFailure(response, Failure.prototype.rootVolumeAdd);
            vmMask.hide();
        }
    });
};

Volume.addVolumes = function(){
    Ext.Ajax.request({
        url: Util.prototype.BASEURL + 'hosts/' + hostTree.selectedNodeId + '/pools.json',
        method: 'GET',
        success: function(response){
            var jsonResponse = Ext.util.JSON.decode(response.responseText);
            poolId = jsonResponse.pools[0].pool['id'];
            ostype = VM.prototype.vmForm.getForm().findField('ostype').getValue();
            // calls add swap and root volume requests
            if(ostype == 'PV'){
                Volume.addSwapVolumeRequest(poolId);
            }
            if(ostype == 'HVM'){
                Volume.addRootVolumeRequest(poolId);
            }
        }
    });
}

Volume.deleteVolume = function(VolumeId, poolId){
    if(poolId){
        Ext.Ajax.request({
                url: Util.prototype.BASEURL + 'hosts/' + hostTree.parentNodeId + '/pools/' + poolId + '/volumes/' + VolumeId,
                method: 'DELETE'
            })
    }
    else{
        poolId = 0;
        // get the pool id
        Ext.Ajax.request({
            url: Util.prototype.BASEURL + 'hosts/' + hostTree.parentNodeId + '/pools.json',
            method: 'GET',
            success: function(response){
                var jsonResponse = Ext.util.JSON.decode(response.responseText);
                poolId = jsonResponse.pools[0].pool['id'];
                // send delete request
                Ext.Ajax.request({
                    url: Util.prototype.BASEURL + 'hosts/' + hostTree.parentNodeId + '/pools/' + poolId + '/volumes/' + VolumeId,
                    method: 'DELETE'
                })
            }
        });
    }
}










