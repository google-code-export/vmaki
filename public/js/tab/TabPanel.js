/*
 * TabPanel constructor
 */

function TabPanel(){
    // Objects initialization
    this.myGeneralTab = new GeneralTab();
    this.myConsole = new ConsoleTab();
    this.myIsoTab = new IsoTab();
    this.mySnapshotTab = new SnapshotTab();
    //this.myLog = new Log();

    // tabpanel
    this.tabPanel = new Ext.TabPanel({
        activeTab: 0,
        resizeTabs: true,
        tabWidth: 90,
        minTabWidth: 60,
        border: false,
        defaults: {layout: 'fit'},
        items: [{
            title: 'General',
            id: 'generalTab',
            iconCls: 'general',
            items: new Ext.Panel({
                id: 'overview',
                border: false,
                html: '<div align="center"><img src="images/logo.png"></div>'
            }),
            listeners:{
                activate: function(panel){
                    if(hostTree.selectedNodeType == 'host'){
                        myTabPanel.myGeneralTab.setHostInformation(panel);
                        myTabPanel.myGeneralTab.setPoolInformation(panel);
                    }
                    if(hostTree.selectedNodeType == 'vm'){
                        myTabPanel.myGeneralTab.setVmInformation(panel);
                    }
                },
                deactivate: function(panel){
                    // destorys the overview panel
                    panel.getComponent('overview').destroy();
                    panel.doLayout();
                }
            }
        },{
            title: 'Console',
            id: 'consoleTab',
            iconCls: 'console',
            items: new Ext.Panel({
                id: 'link'
            }),
            listeners: {
                activate: function(panel){
                    // checks if selected node is a vm
                    if(hostTree.selectedNodeType == 'vm'){
                        //checks if selected vm is running
                        if(hostTree.selectedNode.attributes.status == 'running' || hostTree.selectedNode.attributes.status == 'blocked' || hostTree.selectedNode.attributes.status == 'nostate'){
                            // calls funktion to set the VNC Link
                            myTabPanel.myConsole.setVncLink(panel);
                        }
                        else{
                            // calls function to display vm not running message
                            myTabPanel.myConsole.vmNotRunning(panel);
                        }
                    }
                    else{
                        // calls function to display no vm selected message
                        myTabPanel.myConsole.noVmSelected(panel);
                    }
                },
                deactivate: function(panel){
                        // destorys the link panel
                        panel.getComponent('link').destroy();
                }

            }
        },{
            title: 'Snapshots',
            iconCls: 'snapshot',
            id: 'snapshotTab',
            items: [
                new Ext.Panel({
                    id: 'snapshot'
                })
            ],
            listeners: {
                activate: function(panel){
                     // checks if selected node is a vm
                    if(hostTree.selectedNodeType == 'vm'){
                        myTabPanel.mySnapshotTab.getStore(panel);
                    }
                    else{
                        // calls function to display no vm selected message
                        myTabPanel.mySnapshotTab.noVmSelected(panel);
                    }
                },
                deactivate: function(panel){
                        // destorys the snapshot panel
                        panel.getComponent('snapshot').destroy();
                        panel.doLayout();
                }
            }
        },{
            title: 'ISO',
            id: 'mediaTab',
            iconCls: 'iso',
            listeners: {
                activate: function(panel){
                    panel.add(myTabPanel.myIsoTab.isoGrid);
                    myTabPanel.myIsoTab.isoStore.reload();
                    panel.doLayout();
                }
            }
        },{
            title: 'Users',
            id: 'userTab',
            iconCls: 'user',
            xtype: 'panel',
            items: myUser.userGrid,
            listeners: {
                activate: function(panel){
                    myUser.userStore.reload();
                    panel.doLayout();
                }
            }
        },{
            title: 'Logs',
            xtype: 'panel',
            iconCls: 'log',
            id: 'logTab',
            items: myLog.logGrid,
            listeners: {
                activate: function(panel){
                    panel.doLayout();
                }
            }
        }]
    })
}





