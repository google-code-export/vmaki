

function loginRequest(){
    // get values from form fields
    var username = loginForm.getForm().findField('username').getValue();
    var password = loginForm.getForm().findField('password').getValue();
    // create authentication string
    var authString = username + ':' + password;
    // encode authString to base64
    base64String = Ext.util.base64.encode(authString);
    // set default header
    Ext.Ajax.defaultHeaders= {
        'Authorization': "Basic " + base64String
    };
    // clear existing cookies
    Ext.state.Manager.clear('session_key');
    Ext.state.Manager.clear('user_name');
    // send request to server
    Ext.Ajax.request({
        url: '../session',
        method: 'POST',
        success: function(responseObject){
            // gets the session key out of the response header
            var sessionKey = responseObject.getResponseHeader.Session_Key;          
            // write data to cookie
            Ext.state.Manager.set('session_key', sessionKey);
            Ext.state.Manager.set('user_name', username);
            //Ext.state.Manager.set('user_id', id);
            // redirects the side to the main app
            window.location = 'application.html';
        },
        failure: function(){
            Ext.Msg.alert('Login Failed!', 'Sorry, wrong username or password');
            loginForm.getForm().reset();
        }
    });
}



/*
 * login form
 */

var loginForm = new Ext.FormPanel({
    autoHeight: true,
    autoWidth: true,
    frame: true,
    bodyStyle: 'padding:10px;',
    monitorValid: true,
    items:[{
        xtype: 'textfield',
        fieldLabel: 'Username',
        name: 'username',
        allowBlank: false,
        width: 160
    },{
        xtype: 'textfield',
        fieldLabel: 'Password',
        inputType: 'password',
        name: 'password',
        allowBlank: false,
        width: 160
    }],
    buttons: [{
        text: 'Login',
        formBind: true,
        handler: loginRequest
    }]
})



/*
 * entry point
*/

Ext.onReady(function(){
    Ext.QuickTips.init();

    // initializes cookie provider
    Ext.state.Manager.setProvider(new Ext.state.CookieProvider({
        path: "/",
        expires: new Date(new Date().getTime()+(1000*60*60*24*7))
    }));

    // checks if there is a session key
    // and sends a request to the server if there is one to see
    // if it's still valid
    if(Ext.state.Manager.get('session_key')){
        sessionKey = Ext.state.Manager.get('session_key');
        // sets session key header
        Ext.Ajax.defaultHeaders= {
            'Session_Key': sessionKey
        };
        // sends request to verify the session key
        // if it's valid the page is redirected to the main app
        Ext.Ajax.request({
            url: '../hosts',
            success: function(){
                // redirect
                window.location = 'application.html';
            },
            failure: function(){
                var loginWindow = new Ext.Window({
                    title: 'Please Login',
                    layout: 'fit',
                    width: 320,
                    resizable: false,
                    closable: false,
                    draggable: false,
                    items: loginForm
                });
                loginWindow.show();
            }
        })
    }
    else{
        // login window which contains the login form
        var loginWindow = new Ext.Window({
            title: 'Please Login',
            layout: 'fit',
            width: 320,
            resizable: false,
            closable: false,
            draggable: false,
            items: loginForm
        });
        loginWindow.show();
    }
        
    
});





