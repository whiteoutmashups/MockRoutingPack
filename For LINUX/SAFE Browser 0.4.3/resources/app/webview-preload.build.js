(function () {'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var electron = require('electron');
var rpc = _interopDefault(require('pauls-electron-rpc'));
var browserEsModuleLoader_dist_babelBrowserBuild = require('browser-es-module-loader/dist/babel-browser-build');
var BrowserESModuleLoader = _interopDefault(require('browser-es-module-loader/dist/browser-es-module-loader'));

// it would be better to import this from package.json
const BEAKER_VERSION = '0.0.1';

// method which will populate window.beaker with the APIs deemed appropriate for the protocol
function importWebAPIs () {

  // mark the safe protocol as 'secure' to enable all DOM APIs
  electron.webFrame.registerURLSchemeAsSecure('safe');
  window.beaker = { version: BEAKER_VERSION };
  var webAPIs = electron.ipcRenderer.sendSync('get-web-api-manifests', window.location.protocol);
  for (var k in webAPIs) {
    window[k] = rpc.importAPI(k, webAPIs[k], { timeout: false });
  }
}

// setup UI
importWebAPIs();

// attach globals
window.BrowserESModuleLoader = BrowserESModuleLoader;
}());
//# sourceMappingURL=webview-preload.build.js.map