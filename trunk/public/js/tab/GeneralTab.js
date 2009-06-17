/*
 * Console constructor
 */

function GeneralTab(){
    // Host
    this.hostName = "";
    this.hostStatus = "";
    this.hostCores = "";
    this.hostMemory = "";
    this.hostTotalMemory = "";
    this.hostMhz = "";
    this.cpuModel = "";
    this.hvmSupport = "";
    this.ipAddress = "";

    // Pool
    this.poolId = "";
    this.poolName = "";
    this.poolCapacity = "";
    this.poolAvailable = "";

    // VM
    this.vmName = "";
    this.vmStatus = "";
    this.vmOstype = "";
    this.vmMemory = "";
    this.vmVcpu = "";
    this.vmBootDevice = "";
    this.nicId = "";
    this.vmMedia = "";
    this.isoId = "",
    this.isoFilename = "";

    // Volume
    this.rootVolumeId = "";
    this.rootVolumeName = "";
    this.volumeCapacity = "";

}



// sets the vmaki logo as content for the general tab
GeneralTab.prototype.setLogo = function(panel){
    panel.add(new Ext.Panel({
        border: false,
        id: 'overview',
        html: '<div align="center"><img src="images/logo.png"></div>'
    }))
    panel.doLayout();
}


// sets the variables of the selected host
GeneralTab.prototype.setHostInformation = function(){
    // request to get host information
    Ext.Ajax.request({
        url: Util.prototype.BASEURL + 'hosts/' + hostTree.selectedNodeId + '.json',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        success: function(response){
            var jsonResponse = Ext.util.JSON.decode(response.responseText);
            // gets the name of the host out of the response text
            this.hostName = jsonResponse.data['host[name]'];
            // gets the status of the host and sets the according image
            this.hostStatus = jsonResponse.data['host[connected]'];
            if(this.hostStatus == true){
                this.hostStatus = '../../images/icons/connect.gif'
            }
            if(this.hostStatus == false){
                this.hostStatus = '../../images/icons/disconnect.png'
            }
            // gets the amount of cores
            this.hostCores = jsonResponse.data['host[cores]'];
            // gets the used memory
            this.hostMemory = (jsonResponse.data['host[memory]']/1024).toFixed(0);
            // gets the total memory
            this.hostTotalMemory = (jsonResponse.data['host[total_memory]']/1024).toFixed(0);
            // gets the MHz of the cpu
            this.hostMhz = jsonResponse.data['host[mhz]'];
            // gets the type of the cpu
            this.cpuModel = jsonResponse.data['host[model]'];
            // gets hvm info and sets the according image
            this.hvmSupport = jsonResponse.data['host[hvm_support]'];
            if(this.hvmSupport == true){
                this.hvmSupport = '../../images/icons/accept.gif';
            }
            if(this.hvmSupport == false){
                this.hvmSupport = '../../images/icons/cancel.gif';
            }
            // gets the ip address of the host
            this.ipAddress = jsonResponse.data['host[ip_address]'];
        },
        failure: function(response){
            Failure.checkFailure(response);
        }
    })
}


// sets the variables of the pool
GeneralTab.prototype.setPoolInformation = function(panel){
    // request to get the pool id
    Ext.Ajax.request({
        url: Util.prototype.BASEURL + 'hosts/' + hostTree.selectedNodeId + '/pools.json',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        success: function(response){
            var jsonResponse = Ext.util.JSON.decode(response.responseText);
            poolId = jsonResponse.pools[0].pool['id'];

            // request to the get information of the pool with poolId
            Ext.Ajax.request({
                url: Util.prototype.BASEURL + 'hosts/' + hostTree.selectedNodeId + '/pools/' + poolId + '.json',
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                success: function(response){
                     var jsonResponse = Ext.util.JSON.decode(response.responseText);
                     // gets the name of the pool
                     this.poolName = jsonResponse.data['pool[name]'];
                     // gets the capacity of the pool and formats it to 2 decimals
                     this.poolCapacity = jsonResponse.data['pool[capacity]'].toFixed(2);
                     // gets the available capacity of the pool and formats it to 2 decimals
                     this.poolAvailable = jsonResponse.data['pool[available]'].toFixed(2);


                     // calls the generate host tab function 
                     myTabPanel.myGeneralTab.generateHostTab(panel);
                }
            })
        }
    })
}

// generates the panel which contains the infos of the host
GeneralTab.prototype.generateHostTab = function(panel){
            // adds a panel to the general tab which contains host information
            panel.add(new Ext.Panel({
                title: 'Overview',
                border: false,
                id: 'overview',
                cls: 'general-panel',
                autoLoad: {
                    url: '../../host.html',
                    // callback function which is fired after host.html is loaded and its
                    // elements can be accessed
                    callback: function(){
                        // sets the value of the div tags
                        document.getElementById("host_name").innerHTML = hostName;
                        document.getElementById("host_status").innerHTML = '<img src="' + hostStatus + '">';
                        document.getElementById("pool_name").innerHTML = poolName;
                        document.getElementById("ip_address").innerHTML = ipAddress;
                        document.getElementById("total_memory").innerHTML = hostTotalMemory + ' MB';
                        document.getElementById("used_memory").innerHTML = hostMemory + ' MB';
                        document.getElementById("cpu_type").innerHTML = cpuModel;
                        document.getElementById("cpu_mhz").innerHTML = hostMhz;
                        document.getElementById("cpu_cores").innerHTML = hostCores;
                        document.getElementById("hvm").innerHTML = '<img src="' + hvmSupport + '">';
                        document.getElementById("pool_capacity").innerHTML = poolCapacity + ' GB';
                        document.getElementById("pool_available").innerHTML = poolAvailable + ' GB';                      
                    }
                }
        }))
       // forces the panel to do layout
       panel.doLayout();
}


// sets the attributes of the selected VM
GeneralTab.prototype.setVmInformation = function(panel){
    // request to get vm information
    Ext.Ajax.request({
        url: Util.prototype.BASEURL + 'hosts/' + hostTree.parentNodeId + '/vms/' + hostTree.selectedNodeId + '.json',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        success: function(response){
            var jsonResponse = Ext.util.JSON.decode(response.responseText);
            // gets the name of the out of the response text
            this.vmName = jsonResponse.data['vm[name]'];
            // gets the status of the vm
            this.vmStatus = jsonResponse.data['vm[status]'];
            if(this.vmStatus == 'blocked'){
                this.vmStatus = 'running';
            }
            if(this.vmStatus == 'nostate'){
                this.vmStatus = 'running';
            }
            // gets the ostype of the vm
            this.vmOstype = jsonResponse.data['vm[ostype]'];
            if(this.vmOstype == 'linux'){
                this.vmOstype = 'para-virtualized (PV)';
            }
            if(this.vmOstype == 'hvm'){
                this.vmOstype = 'fully virtualized (HVM)';
            }
            // gets the memory of the vm
            this.vmMemory = jsonResponse.data['vm[memory]'];
            // gets the amount of vcpus of the vm
            this.vmVcpu = jsonResponse.data['vm[vcpu]'];
            // gets the boot loader
            this.vmBootDevice = jsonResponse.data['vm[boot_device]'];
            if(this.vmBootDevice == 'cdrom'){
                this.vmBootDevice = 'CD-ROM';
            }
            if(this.vmBootDevice == 'hd'){
                this.vmBootDevice = 'Hard Disk';
            }
            if(this.vmBootDevice == 'cdrom'){
                this.vmBootDevice = 'Network (PXE)';
            }
            // gets the root volume id of the vm
            this.rootVolumeId = jsonResponse.data['vm[rootvolume_id]'];

            // gets the nic id
            this.nicId = jsonResponse.data['vm[nic_id]'];
            // gets the attached Media
            this.vmMedia = jsonResponse.data['vm[cdrom]'];
            if(this.vmMedia == 'phy'){
                this.vmMedia = 'CD-ROM';
            }
            if(this.vmMedia == 'iso'){
                this.vmMedia = 'ISO File';
            }
            //gets the iso id
            this.isoId = jsonResponse.data['vm[iso_id]'];

            // calls the set volume information function which gets the name and
            // capacity of the vm's root volume'
            if(this.isoId){
                myTabPanel.myGeneralTab.setIsoInformation(this.isoId);
            }
            myTabPanel.myGeneralTab.setVolumeInformation(panel, this.rootVolumeId);            
        },
        failure: function(response){
            Failure.checkFailure(response);
        }
    })
}

GeneralTab.prototype.setIsoInformation = function(isoId){
    Ext.Ajax.request({
        url: Util.prototype.BASEURL + 'isos/' + isoId + '.json',
        method: 'GET',
        headers:{
            'Content-Type': 'application/json'
        },
        success: function(response){
            var jsonResponse = Ext.util.JSON.decode(response.responseText);
            this.isoFilename = jsonResponse.data['iso[filename]'];

        }
    })
}

// sets the attributes of the root volume
GeneralTab.prototype.setVolumeInformation = function(panel, rootVolumeId){
    // request to get the pool id
    Ext.Ajax.request({
        url: Util.prototype.BASEURL + 'hosts/' + hostTree.parentNodeId + '/pools.json',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        success: function(response){
            var jsonResponse = Ext.util.JSON.decode(response.responseText);
            poolId = jsonResponse.pools[0].pool['id'];

            // request to get the volume information
            Ext.Ajax.request({
                url: Util.prototype.BASEURL + 'hosts/' + hostTree.parentNodeId + '/pools/ ' + poolId + '/volumes/' + rootVolumeId + '.json',
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                success: function(response){
                    var jsonResponse = Ext.util.JSON.decode(response.responseText);
                    // gets the name of the volume
                    this.volumeName = jsonResponse.data['volume[name]'];
                    // gets the capacity of the volume
                    this.volumeCapacity = jsonResponse.data['volume[capacity]'].toFixed(1);

                    //calls the generate vm tab function
                    myTabPanel.myGeneralTab.generateVmTab(panel);
                }
            })
        }
    })
}


// generates the panel which contains the vm info
GeneralTab.prototype.generateVmTab = function(panel){
     // adds a panel to the general tab which contains vm information
            panel.add(new Ext.Panel({
                title: 'Overview',
                border: false,
                id: 'overview',
                cls: 'general-panel',
                autoLoad: {
                    url: '../../vm.html',
                    // callback function which is fired after vm.html is loaded and its
                    // elements can be accessed
                    callback: function(){
                        // sets the value of the div tags
                        document.getElementById("vm_name").innerHTML = vmName;
                        document.getElementById("vm_status").innerHTML = vmStatus;
                        document.getElementById("vm_ostype").innerHTML = vmOstype;
                        document.getElementById("vm_memory").innerHTML = vmMemory + ' MB';
                        document.getElementById("vm_vcpu").innerHTML = vmVcpu;
                        document.getElementById("boot_device").innerHTML = vmBootDevice;
                        document.getElementById("root_volume_name").innerHTML = volumeName;
                        document.getElementById("root_volume_capacity").innerHTML = volumeCapacity + ' GB';
                        if(hostTree.selectedNode.attributes.type == 'linux'){
                            document.getElementById("boot_device_row").style.display="none";
                        }
                        document.getElementById("media").innerHTML = vmMedia;
                        if(vmMedia != 'ISO File'){
                            document.getElementById("filename_row").style.display="none";
                            document.getElementById("filename").style.display="none";
                        }
                        else{
                            document.getElementById("filename").innerHTML = isoFilename;
                        }
                        
                        
                    }
                }
        }))

        // forces the panel to do layout
        panel.doLayout();
}


