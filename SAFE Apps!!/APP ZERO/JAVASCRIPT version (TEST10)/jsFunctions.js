//finds button on html page and runs auth function when clicked.

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("auth_button").addEventListener("click", function(){
    authorize();
    
  });
}, false);

// stuff for auth function
var hostName = window.location.host.replace(/.safenet$/g, '');
var LOCAL_STORAGE_TOKEN_KEY = `SAFE_TOKEN_${hostName}`;
var app = {
      name: window.location.host,
      id: 'test.auth',
      version: '0.1.0',
      vendor: 'chris',
      permissions: [
        'LOW_LEVEL_API', "SAFE_DRIVE_ACCESS"
      ]
    }

var authToken = null;

// saving token to localstorage
function setAuthToken(token) {
    authToken = token;
    window.safeAuth.setAuthToken(LOCAL_STORAGE_TOKEN_KEY, token);
  }



// auth function
function authorize() {
    console.log('Authorising application');

    //authenticates with this.app as and this.localblabla as payload
    window.safeAuth.authorise(app, LOCAL_STORAGE_TOKEN_KEY)
      .then((res) => {
          //saving token to localstorage
           if (typeof res === 'object') {
        setAuthToken(res.__parsedResponseBody__.token);
      }
          //success! save res.token
          console.log(res);
          // redirect to new page
          window.location = "dnstest.html";
      }, (err) => {
        // this is denied
        console.error(err);
        // auth failed popup
        alert("Authentication Failed")
      });
};