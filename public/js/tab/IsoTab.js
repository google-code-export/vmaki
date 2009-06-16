

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

    // IsoTab record definition
    this.isoRecord = Ext.data.Record.create([
        {name: 'id', mapping: 'iso.id'},
        {name: 'filename', mapping: 'iso.filename'},
        {name: 'description', mapping: 'iso.description'},
        {name: 'size', mapping: 'iso.size'}
    ]);

    // iso store
    this.isoStore = new Ext.data.JsonStore({
        url: Util.prototype.BASEURL + 'isos.json',
        root: 'isos',
        fields: this.isoRecord
    });

    // iso grid panel
    this.isoGrid = new Ext.grid.GridPanel({
        border: false,
        autoHeight: true,
        autoWidth: true,
        minColumnWidth: 35,
        store: this.isoStore,
        tbar: this.isoToolbar,
		//{header: 'ID', dataIndex: 'id'},
        columns:[
            {header: 'ID', dataIndex: 'id'},
            {header: 'Description', dataIndex: 'description'},
            {header: 'File', dataIndex: 'filename'},
            {header: 'Size', dataIndex: 'size'},
        ]
    })

    //load data into iso store
    this.isoStore.load();
}

IsoTab.prototype.addIso = function(){
    var isoForm = new Ext.FormPanel({
        //fileUpload: true,
        width: 400,
        frame: true,
 //       title: 'File Upload Form',
        autoHeight: true,
        bodyStyle: 'padding: 10px 10px 0 10px;',
        labelWidth: 70,
        defaults: {
            anchor: '90%',
            allowBlank: false,
            msgTarget: 'side'
        },
        items: [{
            xtype: 'textfield',
            fieldLabel: 'Description',
            name: 'description'

        },{
            xtype: 'fileuploadfield',
            id: 'form-file',
            emptyText: 'Select an image',
            fieldLabel: 'File',
            name: 'isoPath',
            buttonCfg: {
                text: '',
                iconCls: 'file-upload'
            }
        }],
        buttons: [{
            text: 'Upload',
            handler: function(){
                //console.log(isoForm.getForm().findField('form-file'));
                isoForm.getForm().submit({
                    fileUpload: true,
                    method: 'POST',
                    url: Util.prototype.BASEURL + 'isos'
                });
            }
        },{
            text: 'Cancel',
            handler: function(){
                addIsoWindow.close();
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


