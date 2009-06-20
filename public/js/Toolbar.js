/*
 * Tabpanel constructor
 */

function ToolBar(){

    // Host Menu
    this.hostMenu = new Ext.menu.Menu({
        id: 'hostMenu',
        items:[{
            text: 'Add Host',
            icon: '../images/icons/server_add.gif',
            handler: Host.addHost
        }]
    })

    // Edit Menu
    this.editMenu = new Ext.menu.Menu({
        id: 'editMenu',
        items:[{
              text: 'VM Settings',
              icon: '../images/icons/computer_wrench.gif',
              handler: VM.getConfig
          },{
              text: 'Media',
              icon: '../images/icons/cd.gif',
              handler: VM.setMedia
          }
        ]
    })

    // Help Menu Entries
    this.helpMenu = new Ext.menu.Menu({
        id: 'helpMenu',
        items:[{
                 text: 'Manual',
                 icon: '../images/icons/book_open.gif',
                 handler: Util.openHelp
                 
             },{
                 text: 'About',
                 icon: '../images/icons/information.gif',
                 handler: ToolBar.showAboutWindow
             }
        ]
    })
       
    // Toolbar
    this.mainToolbar = new Ext.Toolbar({
        height: 250,
        items:[{
            xtype: 'tbbutton',
            text: 'Host',
            menu: this.hostMenu
        },{
            xtype: 'tbbutton',
            text: 'Edit',
            menu: this.editMenu
        },{
            xtype: 'tbbutton',
            text: 'Help',
            menu: this.helpMenu
        },{
            xtype: 'tbspacer'
        },{
            xtype: 'tbspacer'
        },{
            xtype: 'tbseparator'
        },{
            xtype: 'tbspacer'
        },{
            xtype: 'tbspacer'
        },{
            xtype: 'tbbutton',
            id: 'addVmButton',
            cls: 'x-btn-text-icon',
            icon: 'images/icons/computer_add.gif',
            text: 'Add VM',
            disabled: true,
            handler: VM.addVm
        },{
            xtype: 'tbbutton',
            id: 'deleteVmButton',
            cls: 'x-btn-text-icon',
            icon: 'images/icons/computer_delete.gif',
            text: 'Delete VM',
            disabled: 'true',
            handler: VM.deleteVM
        },{
            xtype: 'tbspacer'
        },{
            xtype: 'tbspacer'
        },{
            xtype: 'tbseparator'
        },{
            xtype: 'tbspacer'
        },{
            xtype: 'tbspacer'
        },{
            xtype: 'tbbutton',
            id: 'startVmButton',
            cls: 'x-btn-text-icon',
            icon: 'images/icons/play_green.gif',
            text: 'Start',
            disabled: true,
            handler: VM.start
        },{
            xtype: 'tbbutton',
            id: 'suspendVmButton',
            cls: 'x-btn-text-icon',
            icon: 'images/icons/pause_blue.gif',
            text: 'Suspend',
            disabled: true,
            handler: VM.suspend
        },{
            xtype: 'tbbutton',
            id: 'resumeVmButton',
            cls: 'x-btn-text-icon',
            icon: 'images/icons/play_blue.gif',
            text: 'Resume',
            disabled: true,
            handler: VM.resume
        },{
            xtype: 'tbbutton',
            id: 'shutdownVmButton',
            cls: 'x-btn-text-icon',
            icon: 'images/icons/stop_blue.gif',
            text: 'Shut Down',
            disabled: true,
            handler: VM.shutdown
        },{
            xtype: 'tbbutton',
            id: 'rebootVmButton',
            cls: 'x-btn-text-icon',
            icon: 'images/icons/reload.gif',
            text: 'Reboot',
            disabled: true,
            handler: VM.reboot
        },{
            xtype: 'tbbutton',
            id: 'killVmButton',
            cls: 'x-btn-text-icon',
            icon: 'images/icons/cross.gif',
            text: 'Kill',
            disabled: true,
            handler: VM.kill
        },{
            xtype: 'tbfill'
        },{
            xtype: 'tbtext',
            text: 'logged in as ' + '<b>' + Util.prototype.username + '</b>'
        },{
            xtype: 'tbspacer'
        },{
            xtype: 'tbspacer'
        },{
            xtype: 'tbseparator'
        },{
            xtype: 'tbbutton',
            cls: 'x-btn-text-icon',
            icon: 'images/icons/door.gif',
            text: 'Logout',
            handler: Util.logout
        },{
            xtype: 'tbspacer'
        },{
            xtype: 'tbspacer'
        },{
            xtype: 'tbseparator'
        },{
            xtype: 'tbspacer'
        },{
            xtype: 'tbspacer'
        },{
            xtype: 'panel',
            html: '<img src="/images/logo.png" width="53px" height="22px" />'
        },{
            xtype: 'tbspacer'
        },{
            xtype: 'tbspacer'
        }]
    })
}

ToolBar.prototype.setButtons = function(){
    if(hostTree.selectedNodeType == 'host'){
        Ext.getCmp('addVmButton').enable();
        Ext.getCmp('deleteVmButton').disable();
        Ext.getCmp('deleteVmButton').disable();
        Ext.getCmp('startVmButton').disable();
        Ext.getCmp('suspendVmButton').disable();
        Ext.getCmp('resumeVmButton').disable();
        Ext.getCmp('shutdownVmButton').disable();
        Ext.getCmp('rebootVmButton').disable();
        Ext.getCmp('killVmButton').disable();
    }
    if(hostTree.selectedNodeType == 'vm'){
        if(hostTree.selectedNode.attributes.status == 'running'){
            Ext.getCmp('addVmButton').disable();
            Ext.getCmp('deleteVmButton').disable();
            Ext.getCmp('startVmButton').disable();
            Ext.getCmp('suspendVmButton').enable();
            Ext.getCmp('resumeVmButton').disable();
            Ext.getCmp('shutdownVmButton').enable();
            Ext.getCmp('rebootVmButton').enable();
            Ext.getCmp('killVmButton').enable();
        }
        if(hostTree.selectedNode.attributes.status == 'blocked'){
            Ext.getCmp('addVmButton').disable();
            Ext.getCmp('deleteVmButton').disable();
            Ext.getCmp('startVmButton').disable();
            Ext.getCmp('suspendVmButton').enable();
            Ext.getCmp('resumeVmButton').disable();
            Ext.getCmp('shutdownVmButton').enable();
            Ext.getCmp('rebootVmButton').enable();
            Ext.getCmp('killVmButton').enable();
        }
        if(hostTree.selectedNode.attributes.status == 'shutoff'){
            Ext.getCmp('addVmButton').disable();
            Ext.getCmp('deleteVmButton').enable();
            Ext.getCmp('startVmButton').enable();
            Ext.getCmp('suspendVmButton').disable();
            Ext.getCmp('resumeVmButton').disable();
            Ext.getCmp('shutdownVmButton').disable();
            Ext.getCmp('rebootVmButton').disable();
            Ext.getCmp('killVmButton').disable();
        }
        if(hostTree.selectedNode.attributes.status == 'paused'){
            Ext.getCmp('addVmButton').disable();
            Ext.getCmp('deleteVmButton').disable();
            Ext.getCmp('startVmButton').disable();
            Ext.getCmp('suspendVmButton').disable();
            Ext.getCmp('resumeVmButton').enable();
            Ext.getCmp('shutdownVmButton').disable();
            Ext.getCmp('rebootVmButton').disable();
            Ext.getCmp('killVmButton').disable();
        }
        if(hostTree.selectedNode.attributes.status == 'crashed'){
            Ext.getCmp('addVmButton').disable();
            Ext.getCmp('deleteVmButton').disable();
            Ext.getCmp('startVmButton').disable();
            Ext.getCmp('suspendVmButton').disable();
            Ext.getCmp('resumeVmButton').disable();
            Ext.getCmp('shutdownVmButton').disable();
            Ext.getCmp('rebootVmButton').disable();
            Ext.getCmp('killVmButton').enable();
        }
        if(hostTree.selectedNode.attributes.status == 'provisioning'){
            Ext.getCmp('addVmButton').disable();
            Ext.getCmp('deleteVmButton').disable();
            Ext.getCmp('startVmButton').disable();
            Ext.getCmp('suspendVmButton').disable();
            Ext.getCmp('resumeVmButton').disable();
            Ext.getCmp('shutdownVmButton').disable();
            Ext.getCmp('rebootVmButton').disable();
            Ext.getCmp('killVmButton').disable();
        }
        if(hostTree.selectedNode.attributes.status == 'nostate'){
            if(hostTree.selectedNode.attributes.type == 'hvm'){
                Ext.getCmp('addVmButton').disable();
                Ext.getCmp('deleteVmButton').disable();
                Ext.getCmp('startVmButton').disable();
                Ext.getCmp('suspendVmButton').enable();
                Ext.getCmp('resumeVmButton').disable();
                Ext.getCmp('shutdownVmButton').enable();
                Ext.getCmp('rebootVmButton').enable();
                Ext.getCmp('killVmButton').enable();
            }
            else{
                Ext.getCmp('addVmButton').disable();
                Ext.getCmp('deleteVmButton').disable();
                Ext.getCmp('startVmButton').disable();
                Ext.getCmp('suspendVmButton').disable();
                Ext.getCmp('resumeVmButton').disable();
                Ext.getCmp('shutdownVmButton').disable();
                Ext.getCmp('rebootVmButton').disable();
                Ext.getCmp('killVmButton').disable();
            }
        }
        if(hostTree.selectedNode == null){
            Ext.getCmp('addVmButton').disable();
            Ext.getCmp('deleteVmButton').disable();
            Ext.getCmp('startVmButton').disable();
            Ext.getCmp('suspendVmButton').disable();
            Ext.getCmp('resumeVmButton').disable();
            Ext.getCmp('shutdownVmButton').disable();
            Ext.getCmp('rebootVmButton').disable();
            Ext.getCmp('killVmButton').disable();
        }

    }
}

ToolBar.showAboutWindow = function(){

    var aboutWindow = new Ext.Window({
        title: 'About',
        resizable: false,
        draggable: false,
        width: 300,
        cls: 'about-window',
        html: '<br><div align="center"><img src="images/logo.png"></div><br>\n\
               <p><b>Version 1.0</b></p><br>\n\
               <p>(C)Copyright 2009 Martin Gajdos & Adrian von Allmen</p><br>\n\
               <p>Released under the GNU Public License v3</p><br>\n\
               <div align="center"><a href="http://www.vmaki.org" target="_blank">www.vmaki.org</p></div><br>',
        listeners:{
                show: function(panel){
                    Util.prototype.spot.show(panel.id);
                },
                close: function(panel){
                    Util.prototype.spot.hide();
                }
            }
    });
    aboutWindow.show();
}








