

// Entry Point
Ext.onReady(function(){
    //QuickTips und Blank Image URL
    Ext.QuickTips.init();
    Ext.BLANK_IMAGE_URL = 'images/s.gif';

     hostTree = new Tree();
     myUser = new UserTab();
     myLog = new LogTab();
     myToolBar = new ToolBar();
     myTabPanel = new TabPanel();

     

    // checks if user is authenticatad
    Ext.Ajax.request({
            url: Util.prototype.BASEURL + 'hosts',
            success: function(){
                myLayout = new Layout();
            },
            failure: function(response){
                if(response.status == 401){
                    Util.logout();
                }
            }
        });
        
    // connect hosts with status connect
    Ext.Ajax.request({
        url: Util.prototype.BASEURL + 'hosts/init',
        method: 'PUT'
    });

    // checks if user has admin rights - if not the user and log tab is hiddden
    Ext.Ajax.request({
        url: Util.prototype.BASEURL + 'users.json',
        method: 'GET',
        failure: function(response){
            if(response.status == 403){
                myTabPanel.tabPanel.remove(myTabPanel.tabPanel.getComponent('userTab'));
                myTabPanel.tabPanel.remove(myTabPanel.tabPanel.getComponent('logTab'));
            }
        }
    });


})