/*
 * ConsoleTab constructor
 */

function ConsoleTab(){
    this.link = "";
}

ConsoleTab.prototype.setVncLink = function(panel){
    // request to get the vnc link
    Ext.Ajax.request({
        url: Util.prototype.BASEURL + 'hosts/' + hostTree.parentNodeId + '/vms/' + hostTree.selectedNodeId + '.json',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        success: function(response){
            var jsonResponse = Ext.util.JSON.decode(response.responseText);
            // gets the vnc link out of the response text
            myTabPanel.myConsole.link = jsonResponse.data['vm[vnc_url]'];
            // adds a panel to the tab with the vnc link    
            panel.add(new Ext.Panel({
                border: false,
                id: 'link',
                cls: 'console-panel',
                html: '<h2>VNC Link: </h2>\n\
                       <a href="' + myTabPanel.myConsole.link + '">' + myTabPanel.myConsole.link + '</a>'
            }))
            panel.doLayout();
        },
        failure: function(response){
            Failure.checkFailure(response);
        }
    })     
}

// function called when console tab is activated and vm is not running
ConsoleTab.prototype.vmNotRunning = function(panel){
    panel.add(new Ext.Panel({
        border: false,
        id: 'link',
        cls: 'console-panel',
        html: '<div class="console-error">The selected VM is not running! In order to use the VNC console the VM must be running.</div>'
    }))
    panel.doLayout();
}

// function called when console tab is activated and no vm is selected
ConsoleTab.prototype.noVmSelected = function(panel){
    panel.add(new Ext.Panel({
        border: false,
        id: 'link',
        cls: 'console-panel',
        html: '<div class="console-error">No VM selected - In order to have access to the VNC console you must select a running VM</div>'
    }))
    panel.doLayout();
}

