/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

function Failure(){

}

// Host Failure Messages
Failure.prototype.hostAdd = 'Unable to add Host';
Failure.prototype.hostConnect = 'Unable to connect Host';
Failure.prototype.hostDisconnect = 'Unable to disconnect Host';
Failure.prototype.hostRemove = 'Unable to remove Host';

// Pool Failure Messages
Failure.prototype.poolAdd = 'Unable to add the Pool';

// VM Failure Messages
Failure.prototype.vmAdd = ' Unable to create VM';
Failure.prototype.vmDelete = ' Unable to delete selected VM';
Failure.prototype.vmStart = ' Unable to start the selected VM';
Failure.prototype.vmSuspend = ' Unable to suspend the selected VM';
Failure.prototype.vmResume = ' Unable to resume the selected VM';
Failure.prototype.vmShutdown = ' Unable to shut down the selected VM';
Failure.prototype.vmRestart = 'Unable to restart the selected VM';
Failure.prototype.vmKill = ' Unable to kill the selected VM';
Failure.prototype.vmReconfigure = ' Unable to reconfigure VM';
Failure.prototype.volumeReconfigure = ' Unable to reconfigure Volume';
Failure.prototype.mediaReconfigure = ' Unable to set Media';


// Volume Failure Messages
Failure.prototype.swapVolumeAdd = ' Unable to add the swap volume';
Failure.prototype.rootVolumeAdd = ' Unable to add the root volume';

// iso Failure Messages
Failure.prototype.isoDelete = 'Unable to delete ISO File';
Failure.prototype.isoUpload = 'Unable to upload ISO File';
Failure.prototype.isoUpdate = 'Unable to update ISO File';

// User Failure Messages
Failure.prototype.userAdd = 'Unable to add user';
Failure.prototype.userDelete = 'Unable to delete user';
Failure.prototype.passwordReset = 'Unable to change Password';
Failure.prototype.renameUser = 'Unable to rename user';

// Snapshot Failure Messages
Failure.prototype.snapshotAdd = 'Unable to add snapshot';
Failure.prototype.snapshotRename = 'Unable to delete snapshot';
Failure.prototype.snapshotAdd = 'Unable to restore snapshot';
Failure.prototype.snapshotAdd = 'Unable to rename snapshot';





// Function called when failure during a ajax request occurs
// analyses the failure status and sets the according failure message
Failure.checkFailure = function(response, failure){
    if(response.status == 401){
        Util.logout();
    }
    else if(response.status == 409){
        // VM start
        console.log(failure);
        if(failure == Failure.prototype.vmStart){
            Ext.Msg.alert('Out of Date', 'The VM could not be started because the status of the VM has been changed in the meantime. \n\
            It has been updated to the current version now.');
            hostTree.reload();
        }
        // VM suspend
        if(failure == Failure.prototype.vmSuspend){
            Ext.Msg.alert('Out of Date', 'The VM could not be suspended because the status of the VM has been changed in the meantime. \n\
            It has been updated to the current version now.');
            hostTree.reload();
        }
        // VM resume
        if(failure == Failure.prototype.vmResume){
            Ext.Msg.alert('Out of Date', 'The VM could not be resumed because the status of the VM has been changed in the meantime. \n\
            It has been updated to the current version now.');
            hostTree.reload();
        }
        // VM shutdown
        if(failure == Failure.prototype.vmShutdown){
            Ext.Msg.alert('Out of Date', 'The VM could not be shut down because the status of the VM has been changed in the meantime. \n\
            It has been updated to the current version now.');
            hostTree.reload();
        }
        // VM restart
        if(failure == Failure.prototype.vmRestart){
            Ext.Msg.alert('Out of Date', 'The VM could not be restarted because the status of the VM has been changed in the meantime. \n\
            It has been updated to the current version now.');
            hostTree.reload();
        }
        // VM kill
        if(failure == Failure.prototype.vmKill){
            Ext.Msg.alert('Out of Date', 'The VM could not be killed because the status of the VM has been changed in the meantime.\n\
            It has been updated to the current version now.');
            hostTree.reload();
        }
        // VM reconfigure
        if(failure == Failure.prototype.vmReconfigure){
            Ext.Msg.alert('Out of Date', 'The VM could not be reconfigured because the configuration has been changed in the meantime. \n\
            It has been updated now. Please try again');
            hostTree.reload();
        }
        // VM media
        if(failure == Failure.prototype.mediaReconfigure){
            Ext.Msg.alert('Out of Date', 'The media for the VM could not be reconfigured because the configuration has been changed in the meantime. \n\
            It has been updated now. Please try again');
            hostTree.reload();
        }
        // ISO File update
        if(failure == Failure.prototype.isoUpdate){
            Ext.Msg.alert('Out of Date', 'Your ISO File could not be updated because it has been changed in the meantime. It has been updated to the current version now.');
        }
    }
    else if(response.status == 413){

        if(failure == Failure.prototype.rootVolumeAdd || Failure.prototype.swapVolumeAdd){
            Ext.Msg.alert('Failure', 'There is not enough disk capacity to create the VM');
        }
        if(failure == Failure.prototype.isoUpload){
            Ext.Msg.alert('Failure', 'There is not enough disk capacity to upload the ISO file');
        }
        if(failure == Failure.prototype.snapshotAdd){
            Ext.Msg.alert('Failure', 'There is not enough disk capacity to create the snapshot');
        }
    }
    else{
        if(failure){
            Ext.Msg.alert('Failure', failure);
        }
    }
}