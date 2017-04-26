upload.load.need('js/download.js', function() { return upload.download })
upload.load.need('js/textpaste.js', function() { return upload.textpaste })
upload.load.need('js/loadencryption.js', function() { return window.crypt })
upload.load.need('js/updown.js', function() { return upload.updown })
upload.load.need('js/stringview.js', function() { return upload.stringview })


upload.modules.addmodule({
    name: 'home',
    // Dear santa, https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/template_strings
    template: '\
        <div class="topbar">\
        <div class="viewswitcher">\
            <a id="newpaste" class="btn">New Paste</a>\
        </div>\
        </div>\
        <div id="btnarea">\
                <div class="right"\
                ><a class="btn" id="helpmebtn" >Help</a\
                ><a class="dbtn" id="donatebtn" target="_blank" href="#">Donate</a\
                ></div>\
        </div>\
        <div id="helpmearea" class="help">"Upload" : click or drop to upload a file to the Safe Network<br><br>\
        "New Paste" : click to create a new text paste<br><br>\
        "Help" : hover to display this help<br><br>\
        "Donate" : hover to display bitcoin donation adress qrcode , click to send a donation\
        </div>\
        <div id="helppastearea" class="help">&nbspEdit , paste or drag text in this window<br><br><br>\
        "Save" : click to upload the text the Safe Network<br><br>\
        "Return" : click to return to the main upload window<br><br>\
        "Help" : hover to display this help<br><br>\
        "Donate" : hover to display bitcoin donation adress qrcode , click to send a donation to support SafeShare development\
        </div>\
        <div id="donatearea" class="donate"><img src="donate.png">\
        </div>\
        <div class="hidden downloading" id="uploading">\
            <h1>Uploading</h1>\
            Please wait while your file is transferred to the Safe Network...<br><br><img src="wait.png" >\
            </div>\
        <div class="contentarea" id="uploadview">\
            <div class="centerview">\
            <div id="pastearea" class="boxarea">\
                <h1>Upload</h1>\
            </div>\
            <div class="hidden boxarea" id="uploadprogress">\
                <h1 id="progresstype"></h1>\
                <h1 id="progressamount"></h1>\
                <div id="progressamountbg"></div>\
            </div>\
            <div class="hidden" id="uploadfinish">\
                <h1><a href="" id="finallink">Link</a></h1>\
            </div>\
            <form>\
                <input type="file" id="filepicker" class="hidden" />\
            </form>\
            </div>\
        </div>', 

    init: function () {
        upload.modules.setdefault(this)
        $(document).on('change', '#filepicker', this.pickerchange.bind(this))
        $(document).on('click', '#pastearea', this.pickfile.bind(this))
        $(document).on('dragover', '#pastearea', this.dragover.bind(this))
        $(document).on('dragleave', '#pastearea', this.dragleave.bind(this))
        $(document).on('drop', '#pastearea', this.drop.bind(this))
        $(document).on('click', '#newpaste', this.newpaste.bind(this))
        $(document).on('click', this.triggerfocuspaste.bind(this))
        $(document).on('mouseover', '#helpmebtn', this.helpme.bind(this))
        $(document).on('mouseout', '#helpmebtn', this.helpme.bind(this))
        $(document).on('mouseover', '#donatebtn', this.donate.bind(this))
        $(document).on('mouseout', '#donatebtn', this.donate.bind(this))
        this.initpastecatcher()
        $(document).on('paste', this.pasted.bind(this))
    },
    dragleave: function (e) {
        e.preventDefault()
        e.stopPropagation()
        this._.pastearea.removeClass('dragover')
    },
    drop: function (e) {
        e.preventDefault()
        this._.pastearea.removeClass('dragover')
        if (e.dataTransfer.files.length > 0) {
            this.doupload(e.dataTransfer.files[0])
        }
    },
    dragover: function (e) {
        e.preventDefault()
        this._.pastearea.addClass('dragover')
    },
    pickfile: function(e) {
        this._.filepicker.click()
    },
    pickerchange: function(e) {
        if (e.target.files.length > 0) {
            this.doupload(e.target.files[0])
            $(e.target).parents('form')[0].reset()
        }
    },
    route: function (route, content) {
        if (content && content != 'noref') {
            return upload.download
        }
        return this
    },
    render: function (view) {
        view.html(this.template)
        this._ = {}
        this._.view = view
        this._.filepicker = view.find('#filepicker')
        this._.pastearea = view.find('#pastearea')
        this._.uploadarea = view.find('#uploadview')
        this._.uploading = view.find('#uploading')
        this._.newpaste = view.find('#newpaste')
        this._.progress = {}
        this._.progress.main = view.find('#uploadprogress')
        this._.progress.type = view.find('#progresstype')
        this._.progress.amount = view.find('#progressamount')
        this._.progress.bg = view.find('#progressamountbg')
        this._.helpme = view.find('#helpmearea')
        this._.helppaste = view.find('#helppastearea')
        this._.helpmebtn = view.find('#helpmebtn')
        this._.donatebtn = view.find('#donatebtn')
        this._.donatebtn.prop('href', upload.config.donate_key )
        this._.donatearea = view.find('#donatearea')
        this._.returnarea = view.find('#retbtn')
        $('#footer').hide()
        $('#waiting').hide()
        $('#helpmearea').hide()
        $('#helppastearea').hide()
        $('#donatearea').hide()
    },
    initroute: function () {
        this.focuspaste()
    },
    unrender: function() {
        delete this['_']
    },
    initpastecatcher: function () {
        this.pastecatcher = $('<pre>').prop('id', 'pastecatcher')
        this.pastecatcher.prop('contenteditable', true)
        $('body').append(this.pastecatcher)
    },
    focuspaste: function () {
        setTimeout(function () {
            this.pastecatcher.focus()
        }, 100)
    },
    triggerfocuspaste: function(e) {
        if (e.which != 1) {
            return
        }

        if (e.target == document.body && this._ && !this._.pastearea.hasClass('hidden')) {
            e.preventDefault()
            this.focuspaste()
        }
    },
    progress: function(e) {
        if (e.eventsource = 'encrypt') {
            this._.progress.type.text('Uploading')
        } else {
            this._.progress.type.text('Encrypting')
        }
        var percent = (e.loaded / e.total) * 100
        this._.progress.bg.css('width', percent + '%')
        this._.progress.amount.text(Math.floor(percent) + '%')
    },
    doupload: function (blob) {
        this._.pastearea.addClass('hidden')
        this._.uploadarea.addClass('hidden')
        this._.helpmebtn.addClass('hidden')
        //this._.progress.main.removeClass('hidden')
        //this._.progress.type.text('Uploading')
        //this._.progress.bg.css('width', 0)
        this._.uploading.removeClass('hidden')
        this._.newpaste.addClass('hidden')
        upload.updown.upload(blob, this.progress.bind(this), this.uploaded.bind(this))
    },
    closepaste: function() {
      this._.pastearea.removeClass('hidden')
      this._.view.find('#uploadview').show()
      this._.view.find('.viewswitcher').show()
    },
    dopasteupload: function (data) {
        this._.pastearea.addClass('hidden')
        this._.view.find('#uploadview').hide()
        this._.view.find('.viewswitcher').hide()
        upload.textpaste.render(this._.view, 'Pasted text.txt', data, 'text/plain', this.closepaste.bind(this))
    },
    uploaded: function (data, response) {
		
		console.log ('File Uploaded');
				
        upload.download.delkeys[data.ident] = data.ident;

        try {
            localStorage.setItem('delete-' + data.ident, data.ident)
        } catch (e) {
            console.log(e)
        } 

        if (window.location.hash == '#noref') {
            history.replaceState(undefined, undefined, '#' + data.seed)
            upload.route.setroute(upload.download, undefined, data.seed)
        } else {
            window.location = '#' + data.seed
        }
    },
    helpme: function() {
      //console.log ( 'helpme' );
      
    if(  $("#retbtn").is(":visible") == false ) { // in upload
	      if(  $("#helpmearea").is(":visible") == false ) {
			this._.helpme.show();this._.uploadarea.hide();}
		  else {
			this._.helpme.hide();this._.uploadarea.show();}  
	}   else {  // in paste
	      if(  $("#helppastearea").is(":visible") == false ) {
			this._.helppaste.show();this._.uploadarea.hide();}
		  else {
			this._.helppaste.hide();}		
	}	
    },
    donate: function() {
      //console.log ( 'donate' );
      if(  $("#donatearea").is(":visible") == false )
	{ this._.donatearea.show();this._.uploadarea.hide();this._.uploading.hide();} else
	{ this._.donatearea.hide(); if(  $("#retbtn").is(":visible") == false ) { this._.uploadarea.show(); }; // 
								if(  $("#helpmebtn").is(":visible") == false ) { this._.uploading.show(); }; // in uploading 
    }      
    },
    newpaste: function() {
        this.dopasteupload('')
    },
    pasted: function (e) {
        if (!this._ || this._.pastearea.hasClass('hidden')) {
            return
        }

        var items = e.clipboardData.items

        var text = e.clipboardData.getData('text/plain')

        if (text) {
            e.preventDefault()
            this.dopasteupload(text)
        } else if (typeof items == 'undefined') {
            self = this
            setTimeout(function () {
                if (self.pastecatcher.find('img').length) {
                    var src = self.pastecatcher.find('img').prop('src')
                    if (src.startsWith('data:')) {
                        self.doupload(dataURItoBlob(src))
                    } else {
                        // TODO: Firefox
                    }
                }
            }, 0)
        } else if (items.length >= 1) {
            e.preventDefault()

            for (var i = 0; i < items.length; i++) {
                var blob = items[i].getAsFile()
                if (blob) {
                    this.doupload(blob)
                    break
                }
            }

        }
    },
})
