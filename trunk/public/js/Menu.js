/* 
 * Menu constructor
 */

function Menu(){
    // host context menu items
    this.hostConnectItem = new Ext.menu.Item({
        text: 'Connect',
        icon: '../images/icons/connect.gif',
        handler: Host.connectHost
    })
    this.hostDisconnectItem = new Ext.menu.Item({
        text: 'Disconnect',
        icon: '../images/icons/disconnect.png',
        handler: Host.disconnectHost
    })
    this.hostRemoveItem = new Ext.menu.Item({
        text: 'Remove',
        icon: '../images/icons/server_delete.png',
        handler: Host.removeHost

    // VM context menu items
    })
    this.vmStartItem = new Ext.menu.Item({
        text: 'Start',
        icon: '../images/icons/play_green.gif',
        handler: VM.start
    })
    this.vmSuspendItem = new Ext.menu.Item({
        text: 'Suspend',
        icon: '../images/icons/pause_blue.gif',
        handler: VM.suspend
    })
    this.vmResumeItem = new Ext.menu.Item({
        text: 'Resume',
        icon: '../images/icons/play_blue.gif',
        handler: VM.resume
    })
    this.vmShutdownItem = new Ext.menu.Item({
        text: 'Shut Down',
        icon: '../images/icons/stop_blue.gif',
        handler: VM.shutdown
    })
    this.vmRebootItem = new Ext.menu.Item({
        text: 'Reboot',
        icon: '../images/icons/reload.gif',
        handler: VM.reboot
    })
    this.vmKillItem = new Ext.menu.Item({
        text: 'Kill',
        icon: '../images/icons/cross.gif',
        handler: VM.kill
    })
    this.vmDeleteItem = new Ext.menu.Item({
        text: 'Delete',
        icon: '../images/icons/computer_delete.gif',
        handler: VM.deleteVM
    })
    this.vmSettingsItem = new Ext.menu.Item({
        text: 'Reconfigure',
        icon: '../images/icons/computer_wrench.gif',
        handler: VM.getConfig
    })
    this.vmMediaItem = new Ext.menu.Item({
        text: 'Media',
        icon: '../images/icons/cd.gif',
        handler: VM.setMedia
    })

    // host context menu
    this.hostContextMenu = new Ext.menu.Menu({
        items: [
        this.hostConnectItem,
        this.hostDisconnectItem,
        this.hostRemoveItem
        ]
    })

    // vm context menu
    this.vmContextMenu = new Ext.menu.Menu({
        items:[
        this.vmStartItem,
        this.vmSuspendItem,
        this.vmResumeItem,
        this.vmShutdownItem,
        this.vmRebootItem,
        this.vmKillItem,
        this.vmDeleteItem,
        this.vmSettingsItem,
        this.vmMediaItem
        ]
    })
}

// function called when a node is right clicked
// according to the node type and the status of the node the corresponding
// context menu is shown with the according items either enabled or disabled
Menu.prototype.treeContextHandler = function(node){
    // sets node as selected
    node.select();
    // checks if node is a host
    if(node.attributes.host_id){
        // checks if node is disconnected
        // if so, menu entry disconnect is disabled
        if(node.attributes.status == 'false'){
            hostTree.treeMenu.hostDisconnectItem.disable();
            hostTree.treeMenu.hostConnectItem.enable();
            hostTree.treeMenu.hostRemoveItem.enable();
        }
        // checks if node is connected
        // if so, menu entries connect and remove are disabled
        if(node.attributes.status == 'true'){
            hostTree.treeMenu.hostDisconnectItem.enable();
            hostTree.treeMenu.hostConnectItem.disable();
            hostTree.treeMenu.hostRemoveItem.disable();
        }
        // renders the context menu
        hostTree.treeMenu.hostContextMenu.show(node.ui.getAnchor());
    }
    // checks if node is a vm, if so the status is checked and the items
    // are either enabled or disabled according to the current status
    if(node.attributes.vm_id){
        hostTree.treeMenu.vmContextMenu.show(node.ui.getAnchor());
        if(node.attributes.status == 'running'){
            hostTree.treeMenu.vmStartItem.disable();
            hostTree.treeMenu.vmSuspendItem.enable();
            hostTree.treeMenu.vmResumeItem.disable();
            hostTree.treeMenu.vmShutdownItem.enable();
            hostTree.treeMenu.vmRebootItem.enable();
            hostTree.treeMenu.vmKillItem.enable();
            hostTree.treeMenu.vmDeleteItem.disable();
            hostTree.treeMenu.vmMediaItem.disable();
        }
        if(node.attributes.status == 'blocked'){
            hostTree.treeMenu.vmStartItem.disable();
            hostTree.treeMenu.vmSuspendItem.enable();
            hostTree.treeMenu.vmResumeItem.disable();
            hostTree.treeMenu.vmShutdownItem.enable();
            hostTree.treeMenu.vmRebootItem.enable();
            hostTree.treeMenu.vmKillItem.enable();
            hostTree.treeMenu.vmDeleteItem.disable();
            hostTree.treeMenu.vmMediaItem.disable();
        }
        if(node.attributes.status == 'paused'){
            hostTree.treeMenu.vmStartItem.disable();
            hostTree.treeMenu.vmSuspendItem.disable();
            hostTree.treeMenu.vmResumeItem.enable();
            hostTree.treeMenu.vmShutdownItem.disable();
            hostTree.treeMenu.vmRebootItem.disable();
            hostTree.treeMenu.vmKillItem.disable();
            hostTree.treeMenu.vmDeleteItem.disable();
            hostTree.treeMenu.vmMediaItem.disable();
        }
        if(node.attributes.status == 'shutoff'){
            hostTree.treeMenu.vmStartItem.enable();
            hostTree.treeMenu.vmSuspendItem.disable();
            hostTree.treeMenu.vmResumeItem.disable();
            hostTree.treeMenu.vmShutdownItem.disable();
            hostTree.treeMenu.vmRebootItem.disable();
            hostTree.treeMenu.vmKillItem.enable();
            hostTree.treeMenu.vmDeleteItem.enable();
            hostTree.treeMenu.vmMediaItem.enable();
        }
        if(node.attributes.status == 'crashed'){
            hostTree.treeMenu.vmStartItem.disable();
            hostTree.treeMenu.vmSuspendItem.disable();
            hostTree.treeMenu.vmResumeItem.disable();
            hostTree.treeMenu.vmShutdownItem.disable();
            hostTree.treeMenu.vmRebootItem.disable();
            hostTree.treeMenu.vmKillItem.enable();
            hostTree.treeMenu.vmDeleteItem.disable();
            hostTree.treeMenu.vmMediaItem.disable();
        }
        if(node.attributes.status == 'provisioning'){
            hostTree.treeMenu.vmStartItem.disable();
            hostTree.treeMenu.vmSuspendItem.disable();
            hostTree.treeMenu.vmResumeItem.disable();
            hostTree.treeMenu.vmShutdownItem.disable();
            hostTree.treeMenu.vmRebootItem.disable();
            hostTree.treeMenu.vmKillItem.disable();
            hostTree.treeMenu.vmDeleteItem.disable();
            hostTree.treeMenu.vmSettingsItem.disable();
            hostTree.treeMenu.vmMediaItem.disable();
        }
        if(node.attributes.status == 'nostate'){
            if(node.attributes.type == 'hvm'){
                hostTree.treeMenu.vmStartItem.disable();
                hostTree.treeMenu.vmSuspendItem.enable();
                hostTree.treeMenu.vmResumeItem.disable();
                hostTree.treeMenu.vmShutdownItem.enable();
                hostTree.treeMenu.vmRebootItem.enable();
                hostTree.treeMenu.vmKillItem.enable();
                hostTree.treeMenu.vmDeleteItem.disable();
                hostTree.treeMenu.vmMediaItem.disable();
            }
            if(node.attributes.type == 'linux'){
                hostTree.treeMenu.vmStartItem.disable();
                hostTree.treeMenu.vmSuspendItem.disable();
                hostTree.treeMenu.vmResumeItem.disable();
                hostTree.treeMenu.vmShutdownItem.disable();
                hostTree.treeMenu.vmRebootItem.disable();
                hostTree.treeMenu.vmKillItem.enable();
                hostTree.treeMenu.vmDeleteItem.disable();
                hostTree.treeMenu.vmMediaItem.disable();
            }
        }
    }
}
