import json
import sys
import safeAPI
import hashlib
import time
import datetime
import os
import threading
import Queue
from PyQt4.QtCore import Qt
from PyQt4.QtGui import (QApplication, QDialog, QTextBrowser,
                         QVBoxLayout, QFileDialog, QSlider, QPushButton,
                         QHBoxLayout, QLabel)

safetest = safeAPI.Safe('CrappySync', '0.0.1', 'rid','noWebsiteYet')
safetest.permissions=['LOW_LEVEL_API']
safetest.authenticate()
#ensure the app folder is there
try:
    safetest.mkdir('app','syncdata')
except:
    pass
syncing=True
preset_synctime=5
q=Queue.Queue()
autoSyncActive=Queue.Queue()



class Form(QDialog):

    def __init__(self, parent=None):
        #setting up GUI and setting default values
        super(Form, self).__init__(parent)
        self.setDataPath = QPushButton('set synchronization folder')
        self.syncNow = QPushButton('sync now!')
        self.syncIntervInfo = QLabel('Sync interval (1-60 minutes)')
        self.syncInterv = QSlider(Qt.Horizontal,self)
        self.syncInterv.setRange(1,60)
        self.syncInterv.setValue(preset_synctime)
        self.browser = QTextBrowser()
        layout = QVBoxLayout()
        innerlayout = QHBoxLayout()
        innerlayout.addWidget(self.syncIntervInfo)
        innerlayout.addWidget(self.syncNow)
        layout.addWidget(self.setDataPath)
        layout.addLayout(innerlayout)
        layout.addWidget(self.syncInterv)        
        layout.addWidget(self.browser)
        self.setLayout(layout)
        self.setDataPath.clicked.connect(self.setPath)
        self.syncNow.clicked.connect(self.syncDataNow)
        self.syncInterv.valueChanged.connect(self.newInterv)
        self.setWindowTitle("CrappySync pre_alpha")
        
        #starting autosync-loop        
        t=threading.Thread(target=self.syncloop)
        t.daemon = True
        t.start() 
        
    def syncloop(self, autosyncing = True, preset_synctime=preset_synctime):
        interval=preset_synctime
        timeLastSync=datetime.datetime.now()
        while True:
            if not autosyncing:
                time.sleep(2)
                pass
    
            if autosyncing:
                while True:
                    #if new sync interval is set -> get this value and use it
                    try:
                        interval = q.get_nowait()
                    except:
                        pass
                    
                    #if enough time since last sync has passed => sync
                    if datetime.datetime.now() > (timeLastSync+datetime.timedelta(minutes=interval)):
                        
                        try:
                            autoSyncActive.put(777)
                            self.syncData(dontshow=True)
                            autoSyncActive.get_nowait()
                        except:
                            print('sync failed')
        
                        #reset sync-time
                        timeLastSync=datetime.datetime.now()
                    time.sleep(2)            
            
    def syncData(self,rootPath='app',filePath='syncdata',dontshow=None,subfolder=None):
        
        #get saved sync-folder path
        with open(os.path.expanduser('~/.safeSyncPathStore'),'r') as f:
            localpath=json.loads(f.read())
            f.close()
        if subfolder is not None:
            localpath=localpath+'/'+subfolder
            
        #get online folder
        onlineData=safetest.get_dir(rootPath,filePath)
        #files:
        onlinefiles=[]
        for i in range(len(onlineData['files'])):
            onlinefiles.append(str(onlineData['files'][i]['name']))
        #directories:
        onlinedirs=[]
        for i in range(len(onlineData['subDirectories'])):
            onlinedirs.append(str(onlineData['subDirectories'][i]['name']))
        #get local folder
        localdir=os.listdir(localpath)
        #files&directories:
        localfiles=[]
        localdirs=[]
        for i in range(len(localdir)):
            if os.path.isfile(localpath+'/'+localdir[i]):
                localfiles.append(localdir[i])
            if os.path.isdir(localpath+'/'+localdir[i]):
                localdirs.append(localdir[i])
        
        # sort data ... already synced files will just be left as they are
        #
        # TODO:
        # newer files will be uploaded/downloaded (after deleting the old one)
        # new folders will be created offline/online
        # new files will be uploaded:
        #
        # neweruploadfile
        # newerdownloadfile
        # newonlinefolder
        # newlocalfolder
        # uploadnewfile
        # downloadnewfile
        #
        # only synchronizing non-existing data for now
                
        commonfiles=list(set(onlinefiles).intersection(localfiles))
        commondirs=list(set(onlinedirs).intersection(localdirs))
        listAllDirs=list(set(onlinedirs).union(localdirs))
        for i in range(len(commonfiles)):
            if not dontshow:
                self.browser.append(str(localpath + '/' + commonfiles[i] + ' already synced'))
            onlinefiles.remove(commonfiles[i])
            localfiles.remove(commonfiles[i])
        for i in range(len(commondirs)):
            if not dontshow:
                self.browser.append(str(localpath + '/' + commondirs[i] + '/ already synced'))
            onlinedirs.remove(commondirs[i])
            localdirs.remove(commondirs[i])
            
            
        #download new online data
        #files
        for i in range(len(onlinefiles)):
            safetest.download_file((rootPath+'/'+filePath), localpath, onlinefiles[i])
            if not dontshow:
                self.browser.append(localpath + '/' + onlinefiles[i] + ' downloaded')
        #directories
        for i in range(len(onlinedirs)):
            os.mkdir(localpath+'/'+onlinedirs[i])
            if not dontshow:
                self.browser.append(localpath + '/' + onlinedirs[i] + ' created')
        #upload new local data
        #files
        for i in range(len(localfiles)):
            safetest.upload_file((rootPath+'/'+filePath), localpath, localfiles[i])
            if not dontshow:
                self.browser.append(localpath + '/' + localfiles[i] + ' uploaded')
        #directories
        for i in range(len(localdirs)):
            safetest.mkdir((rootPath+'/'+filePath), localdirs[i])
            if not dontshow:
                self.browser.append(localpath + '/' + localdirs[i] + '/ created')
        
        #sync all inner directories too
        if subfolder is not None:
            for i in range(len(listAllDirs)):
                self.syncData(rootPath, filePath+'/'+listAllDirs[i]
                              , dontshow, subfolder+'/'+listAllDirs[i])
        if subfolder is None:
            for i in range(len(listAllDirs)):
                self.syncData(rootPath, filePath+'/'+listAllDirs[i]
                              , dontshow, listAllDirs[i])
                
        if dontshow is None and subfolder is None:
            q.put(self.syncInterv.sliderPosition())


    def syncDataNow(self):
        autoSyncRunning=None
        # check for autosync already running
        try:
            while autoSyncRunning != 777:
                autoSyncRunning=autoSyncActive.get_nowait()
                if autoSyncRunning == 777:
                    autoSyncActive.put(777)
                    self.browser.append('Autosync Running - just wait for some more moments')
        except:
            pass
        # if no autosync running block autosync and sync manually
        if autoSyncRunning != 777:
            q.put(999)
            self.syncData()

    def setPath(self):
        #get sync-folder and just store the path into your private data
        path = QFileDialog.getExistingDirectory()
        with open(os.path.expanduser('~/.safeSyncPathStore'),'w') as f:
            f.write(json.dumps(str(path)))
            f.close()
        self.browser.append('sync path: '+path)
    
    def newInterv(self, syncInterval):
        self.browser.append('sync interval: '+str(syncInterval)+' minutes')
        #queue new sync-interval data so it can be retrieved by the auto-sync-loop
        q.put(syncInterval)


if __name__ == "__main__":
    app = QApplication(sys.argv)
    form = Form()
    form.resize(600,400)
    form.show()
    app.exec_()