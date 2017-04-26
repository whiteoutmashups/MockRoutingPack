upload.modules.addmodule({
    name: 'updown',
    init: function () {
        // We do this to try to hide the fragment from the referral in IE
        this.requestframe = document.createElement('iframe')
        this.requestframe.src = 'about:blank'
        this.requestframe.style.visibility = 'hidden'
        document.body.appendChild(this.requestframe)
    },
    downloadfromident: function(seed, progress, done, ident) {		
		
		var filename = ident.ident ;
		
		//console.log ( 'download from ident : filename : ', filename );
		
		var name = filename,
                  serviceName = "safeshare_"+filename,
                  filePath    = filename;	
                  options	  = {};
                  

              Safe.dns.getFile(serviceName, name, filePath, options).then(function(file) {
                //console.log ( 'downloaded :' , file );
				var u8 = StringView.base64ToBytes( file.body )
    
				var filebody = [ u8 ];								
												
                //console.log ( 'downloaded :' , filebody, typeof(filebody) ); 
                //console.log ( 'size :' , filebody.length );
                
                upload.updown.downloaded(seed, progress, done, filebody )                
                
              }, addErrorreadservice.bind(null, filename));
	 
    },
    onerror: function(progress) {
      progress('error')
    },
    downloaded: function (seed, progress, done, response) {
		//console.log ( 'downloaded > response : ', response, typeof ( response ) );
        //if (response.target.status != 200) {  TODO : handle errors here
        if ( false ) {
          this.onerror(progress)
        } else {
          this.cache(seed, response)
          progress('decrypting')          
          var blob = new Blob( response, { type: 'application/octet-stream' })
          crypt.decrypt(blob, seed).done(done)

        }
    },     
    encrypted: function(progress, whendone, data) {
		
						
		var filename = data.ident;
		
		var reader = new FileReader();

        var content = data.encrypted;
        
        var b64encoded = StringView.bytesToBase64( content )
		
		//console.log ( 'filename', filename );	
		
		createservice ( filename ).done (createfile( filename )).done(writetofile ( filename, b64encoded, whendone, data )) // whendone : upload.home.uploaded
		
		
    },

    
    cache: function(seed, data) {
      this.cached = data
      this.cached_seed = seed
      //console.log ( 'cached');
    },
    cacheresult: function(data) {
	//console.log ( 'caching');	
	//console.log ( 'cacheresult > data.encrypted : ', data.encrypted , typeof ( data.encrypted ) );
      this.cache(data.seed, [data.encrypted] )
    },
    download: function (seed, progress, done) {
        if (this.cached_seed == seed) {
          progress('decrypting');
          //console.log ( 'download > this.cached : ', this.cached , typeof ( this.cached ) );
          var blob = new Blob ( this.cached , { type: 'application/octet-stream' });
          crypt.decrypt(blob, seed).done(done).progress(progress)
                  } else {
          crypt.ident(seed).done(this.downloadfromident.bind(this, seed, progress, done))
        }
    },
    upload: function (blob, progress, whendone) { 
		//console.log ( "blob : ", blob );
		
        crypt.encrypt(blob) 
			.done(
				this.encrypted.bind(this, progress, whendone)  // whendone : upload.home.uploaded.bind(this)
				)
			.done( this.cacheresult.bind(this) ).progress(progress);
                              
    }
})
