/*
 * Tree constructor
 */

function Tree(){

    this.selectedNode = null;
    this.selectedNodeId = 0;
    this.selectedNodeType = '';
    this.selectedNodeName = '';
    this.parentNodeId = 0;
    this.treeMenu = new Menu();

    // Treeloader
    this.treeLoader = new Ext.tree.TreeLoader({
        requestMethod: 'GET',
        dataUrl: Util.prototype.BASEURL + 'hosts/allvms.json',
        listeners: {
            loadexception: function(loader, node, response){
                Failure.checkFailure(response);
            }
        }
    })

    // Root Node
    this.rootNode = new Ext.tree.AsyncTreeNode({
        text: 'Hosts',
        expanded: true,
        icon: 'images/icon/server.gif'
    });

    // TreePanel
    this.tree = new Ext.tree.TreePanel({
        loader: this.treeLoader,
		animate: false,
        root: this.rootNode,
        border: false,
        rootVisible: false,
        lines: false

    });
    // tree sorter
    this.sorter = new Ext.tree.TreeSorter(this.tree,{
        folderSort: true,
        dir: 'asc',
        sortType: function(node){
            return node.attributes.id
        }
    })


/*
 * listeners
 */

    // fires when node is right clicked
    this.tree.on('contextmenu', this.treeMenu.treeContextHandler);
    
    // fires when node selection changes
    this.tree.getSelectionModel().on('selectionchange', this.selectedNodeChange);
    
    // fires when tree is loaded and triggers the setIcon handler
    this.treeLoader.on('load', function(treeloader, node, response){
        Tree.setHostIcon(node);

//        if(hostTree.selectedNode){
//            var n = hostTree.tree.getNodeById(hostTree.selectedNode.attributes.id);
//            n.ensureVisible();
//            var el = Ext.fly(n.getUI().getEl());
//            el.select();
        
    });

}



/*
 * object methods
 */

// reload Tree
Tree.prototype.reload = function(){
    hostTree.rootNode.reload();
}

// returns the selected node
Tree.prototype.getSelectedNode = function (){
    return this.selectedNode;
}

// sets the selected node
Tree.prototype.setSelectedNode = function(){
    this.selectedNode = this.tree.getSelectionModel().getSelectedNode();
}

// sets the Attributes of the selected node
Tree.prototype.setSelectedNodeAttributes = function(node){
    // checks if a node is a host or vm and sets the global attributes
    if(node.attributes.host_id){
        this.selectedNodeId = node.attributes.host_id;
        this.selectedNodeType = 'host';
        this.selectedNodeName = node.attributes.text;
    }
    else{
        this.selectedNodeId = node.attributes.vm_id;
        this.selectedNodeType = 'vm';
        this.selectedNodeName = node.attributes.text;
    }
}

// sets the id of the parent
Tree.prototype.setParentNodeId = function(node){
    hostTree.parentNodeId = node.parentNode.attributes.host_id;
}

// function called when the selected node changes
Tree.prototype.selectedNodeChange = function(){
    // get the selected node
    hostTree.setSelectedNode();
    var node = this.getSelectedNode();
    // checks if a node is selected and sets selected node's variables
    if(node){
        hostTree.setSelectedNodeAttributes(node);
    }
    else{
        hostTree.selectedNodeId = null;
        hostTree.selectedNodeType = null;
        hostTree.selectedNodeName = null;
    }
    // checks if selected node is a vm and sets the parentNodeId if so
    if(hostTree.selectedNodeType == 'vm'){
        hostTree.setParentNodeId(hostTree.selectedNode);
    }
    // calls the enable buttons function
    myToolBar.setButtons();

    // calls the active tab and reactivates it
    activeTab = myTabPanel.tabPanel.getActiveTab()
    myTabPanel.tabPanel.render(activeTab);


}





/*
 * class methods
 */


// sets the host icon according to the status
// this function is called every time the tree is reloding
Tree.setHostIcon = function(node){
    // gets the first child node
    var hostNode = node.firstChild;
    // gets the array index of the last child
    var lastChildIndex = node.childNodes.indexOf(node.lastChild);
    // sets the icon for each child
    for (var i = 0; i <= lastChildIndex; i++){
        hostNode.expand();
        // checks if disconnected and sets icon
        if(hostNode.attributes.status == 'false'){
            hostNode.getUI().addClass('server-disconnected-node');
        }
        // checks if connected and sets icon
        if(hostNode.attributes.status == 'true'){
            hostNode.getUI().addClass('server-connected-node');
        }
        // checks if host has vm nodes and calls setVmIcon function if os
        if(hostNode.hasChildNodes()){
            Tree.setVmIcon(hostNode);
        }
        // gets the next sibling
        hostNode = hostNode.nextSibling;
    }
}

// sets the icon of the vms
// this function is called every time the tree is reloading
Tree.setVmIcon = function(node){
    // gets the first child node
    var vmNode = node.firstChild;
    // gets the array index of the last child
    var lastChildIndex = node.childNodes.indexOf(node.lastChild);
    // sets the icon for each child
    for (var i = 0; i <= lastChildIndex; i++){
        // checks the status and sets the according icon
        if(vmNode.attributes.status == 'running'){
            vmNode.getUI().addClass('vm-running-node');
        }
        if(vmNode.attributes.status == 'blocked'){
            vmNode.getUI().addClass('vm-running-node');
        }
        if(vmNode.attributes.status == 'paused'){
            vmNode.getUI().addClass('vm-suspended-node');
        }
        if(vmNode.attributes.status == 'shutdown'){
            vmNode.getUI().addClass('vm-shutdown-node');
        }
        if(vmNode.attributes.status == 'crashed'){
            vmNode.getUI().addClass('vm-crashed-node');
        }
        if(vmNode.attributes.status == 'provisioning'){
            vmNode.getUI().addClass('vm-provisioning-node');
            VM.checkVmStatus(vmNode.attributes.vm_id, node.attributes.host_id);
        }
        if(vmNode.attributes.status == 'restoring'){
            vmNode.getUI().addClass('vm-restoring-node');
            VM.checkVmStatus(vmNode.attributes.vm_id, node.attributes.host_id);
        }
        if(vmNode.attributes.status == 'provisioned'){
            vmNode.getUI().addClass('vm-shutdown-node');
        }
        if(vmNode.attributes.status == 'nostate'){
            if(vmNode.attributes.type == 'hvm'){
                vmNode.getUI().addClass('vm-running-node');
            }
            if(vmNode.attributes.type == 'linux'){
                setTimeout('hostTree.rootNode.reload()', 5000);
            }            
        }
        // get next sibling
        vmNode = vmNode.nextSibling;
    }
}



















