/*
 * Util constructor
 */

function Util(){

}

// Base URL for the requests
//Util.prototype.BASEURL = 'http://localhost:3000/';
Util.prototype.BASEURL = 'http://' + document.location.host + '/';

// Session Manager
Ext.state.Manager.setProvider(new Ext.state.CookieProvider({
    path: "/"
}));

// gets the session key and the user name out of the cookie
Util.prototype.sessionKey = Ext.state.Manager.get('session_key');
Util.prototype.username = Ext.state.Manager.get('user_name');

// spotlight
Util.prototype.spot = new Ext.Spotlight({
    easing: 'easeNone',
    animate: 'false',
    duration: 0.05
});

// sets Session Key to header
Ext.Ajax.defaultHeaders= {
    'Session_Key': Util.prototype.sessionKey
};

// logout function
Util.logout = function(){
    Ext.state.Manager.clear('session_key');
    Ext.state.Manager.clear('user_name');
    window.location = 'index.html';
}

// function to prepend root element to json strings
Util.prependRoot = function(root, string){
    return "{" + root + ":" + string + "}";
}



     



    
