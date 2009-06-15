/*
 * Log constructor
 */

function LogTab(){
    
    // log tool bar
    this.logToolbar = new Ext.Toolbar({
        items:[{
            xtype: 'tbbutton',
            cls: 'x-btn-text-icon',
            icon: 'images/icons/reload.gif',
            text: 'Refresh',
            handler: this.refresh
        },{
            xtype: 'tbbutton',
            cls: 'x-btn-text-icon',
            icon: 'images/icons/cross.gif',
            text: 'Clear',
            handler: this.clear
        }]
    })

    // log data record
    this.logRecord = new Ext.data.Record.create([
        {name: 'id',    mapping: 'dblogger.id'},
        {name: 'user', mapping: 'dblogger.user'},
        {name: 'subject', mapping: 'dblogger.subject'},
        {name: 'text', mapping: 'dblogger.text'},
        {name: 'created_at', mapping: 'dblogger.created_at'}
    ])

    // log store
    this.logStore = new Ext.data.JsonStore({
        url: Util.prototype.BASEURL + 'log.json',
        root: 'dbloggers',
        fields: this.logRecord,
        listeners: {
            loadexception: function(loader, node, response){
                Failure.checkFailure(response);
            }
        }
    });


    // log grid
    this.logGrid = new Ext.grid.GridPanel({
        border: false,
        //height: 600,
        //autoScroll: true,
        //autoHeight: true,
        autoWidth: true,
        //stripeRows: true,
        minColumnWidth: 50,
        autoExpandColumn: 'text',
        store: this.logStore,
        tbar: this.logToolbar,
        columns:[
            {header: "User", dataIndex: 'user'},
            {header: "Subject", dataIndex: 'subject'},
            {id: 'text', header: "Description", dataIndex: 'text'},
            {header: "Time", dataIndex: 'created_at', width: 150}
        ]
    });

    this.logStore.load();

}

LogTab.prototype.refresh = function(){
    myLog.logStore.reload();
}

LogTab.prototype.clear = function(){
    Ext.Ajax.request({
        url: Util.prototype.BASEURL + 'log',
        method: 'DELETE',
        success: function(){
            myLog.logStore.reload();
            myLog.logStore.removeAll();
        },
        failure: function(response){
            Failure.checkFailure(response, Failure.prototype.logClear);
        }
    })
}



