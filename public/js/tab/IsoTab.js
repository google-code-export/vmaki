

function IsoTab(){
    // toolbar
    this.isoToolbar = new Ext.Toolbar({
        items:[{
            xtype: 'tbbutton',
            cls: 'x-btn-text-icon',
            icon: 'images/icons/user_add.gif',
            text: 'Add ISO',
            handler: this.addIso
        },{
            xtype: 'tbbutton',
            cls: 'x-btn-text-icon',
            icon: 'images/icons/user_cross.gif',
            text: 'Delete ISO',
            handler: this.deleteISO
        }]
    })
}

IsoTab.prototype.addIso = function(){

}

IsoTab.prototype.deleteIso = function(){
    
}


