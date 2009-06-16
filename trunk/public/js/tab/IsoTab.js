

function IsoTab(){
    // toolbar
    this.isoToolbar = new Ext.Toolbar({
        items:[{
            xtype: 'tbbutton',
            cls: 'x-btn-text-icon',
            icon: 'images/icons/cdr_add.gif',
            text: 'Add ISO',
            handler: this.addIso
        },{
            xtype: 'tbbutton',
            cls: 'x-btn-text-icon',
            icon: 'images/icons/cdr_cross.gif',
            text: 'Delete ISO',
            handler: this.deleteISO
        }]
    })
}

IsoTab.prototype.addIso = function(){
    var isoForm = new Ext.FormPanel({
        fileUpload: true,
        width: 500,
        frame: true,
        autoHeight: true,
        bodyStyle: 'padding: 10px 10px 0 10px;',
        defaults: {
            allowBlank: false,
            msgTarget: 'side'
        },
        items: [{
            xtype: 'textfield',
            fieldLabel: 'Name'
        },{
            xtype: 'fileuploadfield',
            id: 'form-file',
            emptyText: 'Select an ISO File...',
            fieldLabel: 'ISO File',
            name: 'iso_path',
            buttonCfg:{
                text: ''
            }

            
        }]
    })

    // Create new Window and add render hostForm to it
    var addIsoWindow = new Ext.Window({
        layout: 'fit',
        title: 'Add ISO File',
        resizable: false,
        draggable: false,
        items: isoForm,
        listeners:{
                show: function(panel){
                    Util.prototype.spot.show(panel.id);
                },
                close: function(panel){
                    Util.prototype.spot.hide();
                }
            }
    });

    addIsoWindow.show();

}

IsoTab.prototype.deleteIso = function(){
    
}


