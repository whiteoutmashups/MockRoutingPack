(function(window) {
  "use strict";
  window.upload = {}
}(window));

(function(upload) {
  upload.config = {}

  upload.load = {
    loaded: 0,
    doneloaded: function() {
      this.loaded -= 1
      if (this.loaded <= 0) {
        this.cb()
      }
    },
    load: function(filename, test, onload) {
      if (test && test()) {
        return false
      }
      var head = document.getElementsByTagName('head')[0]
      var script = document.createElement('script')
      script.src = './' + filename
      script.async = true
      script.onload = onload
      head.appendChild(script)
      return true
    },
    needsome: function() {
      this.loaded += 1
      return this
    },
    done: function(callback) {
      this.loaded -= 1
      this.cb = callback
      return this
    },
    then: function(callback) {
      this.deferred.then(callback)
      return this
    },
    need: function(filename, test) {
      this.loaded += 1
      if(!this.load(filename, test, this.doneloaded.bind(this))) {
        this.loaded -= 1
      }
      return this
    }
  }

  upload.modules = {
      modules: [],
      addmodule: function (module) {
          this.modules.unshift(module)
          upload[module.name] = module
      },
      initmodule: function (module) {
          module.init()
      },
      setdefault: function (module) {
          this.default = module
      },
      init: function () {
          this.modules.forEach(this.initmodule.bind(this))
      }
  }

  upload.modules.addmodule({
      name: 'footer',
      init: function() {
          $('#footer').html(upload.config.footer)
      }
  })  

  upload.modules.addmodule({
      name: 'route',
      init: function () {
          window.addEventListener('hashchange', this.hashchange.bind(this))
          this.hashchange()
      },
      setroute: function (module, routeroot, route) {
          view = $('.modulecontent.modulearea')
          if (!this.currentmodule || this.currentmodule != module) {
              // TODO: better
              if (this.currentmodule) {
                  this.currentmodule.unrender()
              }
              this.currentmodule = module
              view.id = 'module_' + module.name
              module.render(view)
          }
          module.initroute(route, routeroot)
      },
      tryroute: function (route) {
          var isroot = route.startsWith('/')
          var normalroute = isroot ? route.substring(1) : route
          var route = normalroute.substr(normalroute.indexOf('/') + 1)
          var routeroot = normalroute.substr(0, normalroute.indexOf('/'))
          var chosenmodule
          if (!normalroute) {
              chosenmodule = upload.modules.default
          } else {
              upload.modules.modules.every(function (module) {
                  if (!module.route) {
                      return true
                  }
                  if (module.route(routeroot, route)) {
                      chosenmodule = module
                      return false
                  }
                  return true
              })
          }
          if (!chosenmodule) {
              chosenmodule = upload.modules.default
          }
          setTimeout(this.setroute.bind(this, chosenmodule, routeroot, route), 0)
      },
      hashchange: function () {
          this.tryroute(window.location.hash.substring(1))
      }
  })
}(window.upload));

function addError(element, error) {
	var deferred = $.Deferred();	
  console.log(error.toString());
  if ( error.status == -1503 ) upload.download.progress('error') 
  if ( error.status == 0 ) { document.getElementById('nolauncher').className = 'waiting';
						document.getElementById('waitauth').className = 'hidden'; }
  return deferred.promise();
 }
 
 function addErrorwritefile(element, error) {
	var deferred = $.Deferred();	
  console.log("write error : " ,error.toString());
  if ( error.status == -1503 ) upload.download.progress('error') 
  return deferred.promise();
 }
 
  function addErrorcreatefile(element, error) {
	var deferred = $.Deferred();	
  console.log("create file error : " ,error.toString());
  if ( error.status == -1503 ) upload.download.progress('error') 
  return deferred.promise();
 }
 
   function addErrorcreateservice(element, error) {
	var deferred = $.Deferred();	
  console.log("create service error : " ,error.toString());
  if ( error.status == -1503 ) upload.download.progress('error') 
  return deferred.promise();
 }
 
    function addErrorreadservice(element, error) {
	var deferred = $.Deferred();	
  console.log("read service error : " ,error.toString());
  upload.download.progress('error') 
  return deferred.promise();
 }
 
   function addErrorcreatedir(element, error) {
	var deferred = $.Deferred();	
  console.log("create dir error : " ,error.toString());
  if ( error.status == -1503 ) upload.download.progress('error') 
  return deferred.promise();
 }
 
    function addErrordeletedir(element, error) {
	var deferred = $.Deferred();	
  console.log("delete dir error : " ,error.toString());
  upload.download.progress('error') 
  return deferred.promise();
 }

 var Safe = null;
 
function initialize(node) {
	  Safe = new SafeApp({
			  id: 'safeid',
			  name: 'safeshare',
			  vendor: 'nice',
			  version: '0.0.1'
			}, []); // include SAFEDrive access
		   
			//console.log ( 'Initialized a new Safe instance. You can authenticate now.' );
		  }
              
function authorize(node) {
	Safe.auth.authenticate().then(function() {	
  //console.log ('Authorizing.');
  isAuthorized ( this );
  
}, addError.bind(null, node.nextElementSibling));
}

function isAuthorized(node) {
  Safe.auth.isAuth().then(function(bool) {
	var isauth = bool ? 'Authorized successfully.' : 'Not authorized.';
	console.log (isauth);
	if  ( bool == true ) { upload.modules.init(); }  // party starts now
			else {
		  document.getElementById('waitauth').className = 'hidden';
		  document.getElementById('noauth').className = 'waiting';		  
          //alert("Access denied\nLauncher has denied access.");
      }
  }, addError.bind(null, node.nextElementSibling));
}

function writetofile ( filename, content, whendone, data ) {
	var deferred = $.Deferred();
	
	var path = "/"+filename+"/"+filename;	
	
	Safe.nfs.updateFile(path, content , {
			isPathShared: false
			}).then(function() {					 
			//console.log ( 'File Uploaded.');
			whendone ( data );
			}, addErrorwritefile.bind(null, filename));
			
	return deferred.promise();
}

function createfile ( filename ) {
	var deferred = $.Deferred();
	var path = "/"+filename+"/"+filename;	

	Safe.nfs.createFile(path, {
			metadata: 'none',
			isVersioned: false,
			isPathShared: false
			}).then(function() {		
		
		//console.log ( 'Created file. Now go add content!');
		
		}, addErrorcreatefile.bind(null, filename));
	return deferred.promise();
}


function createdir ( dirname ) {
	var deferred = $.Deferred();

	Safe.nfs.createDirectory(dirname, {
                isPrivate: false,
                metadata: 'none',
                isVersioned: false,
                isPathShared: false
              }).then(function() {
              //  console.log ( 'createdir : Created directory.');
              }, addErrorcreatedir.bind(null, dirname));
	return deferred.promise();
}          

function deletename ( name ) {
	var deferred = $.Deferred();
			  var deleteDirectory = "/"+name;
              Safe.nfs.deleteDirectory(deleteDirectory, {isPathShared: window.isPathShared}).then(function() {
                console.log ( '...');
              }, addErrordeletedir.bind(null, name));	
	
	            Safe.dns.deleteName(name).then(function() {
                console.log ( 'File Deleted.');
              }, addErrorcreatedir.bind(null, name));
	return deferred.promise();
}    

function createservice ( filename ) {
	var deferred = $.Deferred();
	var payload = {
                longName: filename,
                serviceName: "safeshare_"+filename,
                serviceHomeDirPath: "/"+filename,
                isPathShared: false
              };
	
	createdir ( "/"+filename );
	
    Safe.dns.createServiceAndName(payload).then(function() {
                //console.log (  'Created new service and name.');
              }, addErrorcreateservice.bind(null, filename));
	return deferred.promise();
}

function Uint8ToBase64(u8Arr){
  var CHUNK_SIZE = 0x8000; //arbitrary number
  var index = 0;
  var length = u8Arr.length;
  var result = '';
  var slice;
  while (index < length) {
    slice = u8Arr.subarray(index, Math.min(index + CHUNK_SIZE, length)); 
    result += String.fromCharCode.apply(null, slice);
    index += CHUNK_SIZE;
  }
  return btoa(result);
}

(function () {
upload.load.needsome().need('config.js').need('js/shims.js').need('deps/zepto.min.js').done(function() {
    upload.load.needsome().need('js/home.js', function() {return upload.home}).done(function() {
      if (typeof upload.config != 'undefined') {
		  
		  initialize(this);
		  
		  //console.log ( 'storage : ', Safe.storage.get() );
		  if ( Safe.storage.get() == null ) { var r = confirm( upload.config.disclaimer );/*disclaimer stuff here! */} else { var r = true; };
		  //var r = confirm( upload.config.disclaimer );
		  if (r == true) {
					//console.log ( "accepted");
					document.getElementById('waitauth').className = 'waiting';
					document.getElementById('waitnet').className = 'hidden'; 			 					
					
					//initialize(this);
					authorize(this);
			} else {
				//console.log ( "canceled");
				document.getElementById('waitauth').className = 'hidden';
				document.getElementById('waitnet').className = 'hidden';
				document.getElementById('canceled').className = 'waiting';
			    return;
			} 		   
		  
      } else {
          alert("Please configure with config.js (see config.js.example)")
      }
    })
})
}(upload))
