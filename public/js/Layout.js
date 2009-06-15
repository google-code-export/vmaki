function Layout(){
    //viewport
    this.viewport = new Ext.Viewport({
        layout: 'border',
        //hidden: true,
        renderTo: Ext.getBody(),
        items: [{
            region: 'north',
            xtype: 'panel',
            height: 30,
            border: false,
            items: myToolBar.mainToolbar
        },{
            region: 'west',
            xtype: 'panel',
            items: hostTree.tree,
            //border: false,
            title: 'Hosts',
            split: true,
            width: 200
        },{
            region: 'center',
            xtype: 'panel',
            layout: 'fit',
            //border: false,
            items: myTabPanel.tabPanel
        }]
    });
}



   




