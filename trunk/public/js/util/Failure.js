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
Failure.prototype.vmAdd = ' Unable to create Host';
Failure.prototype.vmDelete = ' Unable to delete selected VM';
Failure.prototype.vmStart = ' Unable to start the selected VM';
Failure.prototype.vmSuspend = ' Unable to suspend the selected VM';
Failure.prototype.vmResume = ' Unable to resume the selected VM';
Failure.prototype.vmShutdown = ' Unable to shut down the selected VM';
Failure.prototype.vmRestart = 'Unable to restart the selected VM';
Failure.prototype.vmKill = ' Unable to kill the selected VM';
Failure.prototype.memoryReconfigure = ' Unable to reconfigure Memory';
Failure.prototype.vcpuReconfigure = ' Unable to reconfigure VCPU';
Failure.prototype.volumeReconfigure = ' Unable to reconfigure Volume';
Failure.prototype.bootdeviceReconfigure = ' Unable to reconfigure boot device';
Failure.prototype.bootdeviceReconfigure = ' Unable to reconfigure NIC';
Failure.prototype.mediaReconfigure = ' Unable to set Media';


// Volume Failure Messages
Failure.prototype.swapVolumeAdd = ' Unable to add the swap volume';
Failure.prototype.rootVolumeAdd = ' Unable to add the root volume';

// iso Failure Messages
Failure.prototype.isoDelete = 'Unable to delete ISO File';

// User Failure Messages
Failure.prototype.userAdd = 'Unable to add user';
Failure.prototype.userDelete = 'Unable to delete user';
Failure.prototype.passwordReset = 'Unable to change Password';
Failure.prototype.renameUser = 'Unable to rename user';





// Function called when failure during a ajax request occurs
// analyses the failure status and sets the according failure message
Failure.checkFailure = function(response, failure){
    if(response.status == 401){
        Util.logout();
    }
    else{
        if(failure){
            Ext.Msg.alert('Failure', failure);
        }
    }
}