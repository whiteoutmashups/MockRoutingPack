(function () {'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var electron = require('electron');
var log = _interopDefault(require('loglevel'));
var redux = require('redux');
var thunk = _interopDefault(require('redux-thunk'));
var createNodeLogger = _interopDefault(require('redux-node-logger'));
var promiseMiddleware = _interopDefault(require('redux-promise'));
var _ = _interopDefault(require('lodash'));
var url = _interopDefault(require('url'));
var rpc = _interopDefault(require('pauls-electron-rpc'));
var reduxActions = require('redux-actions');
var immutable = require('immutable');
var safeJs = require('safe-js');
var zerr = _interopDefault(require('zerr'));
var os = _interopDefault(require('os'));
var emitStream = _interopDefault(require('emit-stream'));
var EventEmitter = _interopDefault(require('events'));
var path = _interopDefault(require('path'));
var fs = _interopDefault(require('fs'));
var globalModules = require('global-modules');
var co = require('co');
var electronLocalshortcut = require('electron-localshortcut');
var electronLocalshortcut__default = _interopDefault(electronLocalshortcut);
var jetpack = _interopDefault(require('fs-jetpack'));
var unusedFilename = _interopDefault(require('unused-filename'));
var speedometer = _interopDefault(require('speedometer'));

// TODO - pull appropriately from build

let env = process.env.NODE_ENV || 'production';

var env$1 = {
  name: env
};

var beakerSitedata = {
  get: 'promise',
  set: 'promise'
};

function log$1(...args) {
  if (env$1.name !== 'production') {
    console.log.apply(console, args);
  }
}

const UPDATE_SITE_DATA = 'UPDATE_SITE_DATA';

const { updateSiteData } = reduxActions.createActions(UPDATE_SITE_DATA);

const initialState = immutable.List([immutable.Map({
    id: 'https:duckduckgo.com',
    data: immutable.Map({
        favicon: `data:image/pngbase64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACkklEQVQ4T22SXUiTURjH/+ds2jTNPiTbXC1jbtAYaAh97cKBYlpWk+gDFhQUeOFFYBdCXqwQirqT6KKiDzTqIjIZpKG4YQsligLN3FzYcCWDPtaG7vuceN+Xzb3mA+fiff7P//c8530OwRoRtOn7QIhdJnHerx3wn11dTvITC7ZqJzjXcgIHAW4DRCvpPMiBDsLhACHB7QNzrVlfDhA4pl8E5yegUHpUpjokpt+tNRw4YxYQ8lw36FcLBSIg0FrtpDTVw1AwGdfXQFVvg6axDZSlETxT+x+IIrWPsYJunXOulbjqoawq1U9wQuuESra5ArsejstMIccFxD6+keUIZ+/no/795OsRwwAl5BEHfylUFN8bx8jbn7C3mURDdCmJ7z8iWNd5UA4AOc44PycAOMDDANkoVBTddSOFIiSTaeh15aKp/eoLdPlugkX+5EEkD/EfFgArEXE8gbl2D8KRGMo3rc8JoesnodKOoaRmGQs3NMj8VYga8a0ChOpPwXL5mrS8TBhsRpODhMdL8XtIHDQXxNsiv0KivBLmx2MSIBUCm63CvKMSLE6h2pkQT9i9QVClK3xprnZSsH4OxbMs1vjKm+vgbTGiUJ1EiSmGxGIhlj4XSaMjc5qB2sU1VqgMLgJYsq6yB26o1eI7gddWCx5flo0tTgd4QnGfVXxIM01GF2XozlB4xNV13cFgQR/OmzqRmv6ED8O9mDhQho7eBRGkYLAwip7dr70SQIipRmOUAIdA4AnvbcJT6zfEUnFQutL80q2A0NrCgWHziLdUukpeTDUYXcJncpvu/uyVo/0NO2zYWqxBdNKVDnRftIMo2wXdPOq1Zm0ygJAU/skWpWGIgzTI1gU++ivta7a6kc7P/wNyZ/k5PvUO0QAAAABJRU5ErkJggg==`
    })
})]);

function sitedata(state = initialState, action) {
    let payload = immutable.fromJS(action.payload);

    switch (action.type) {
        case UPDATE_SITE_DATA:
            {
                let index = state.findIndex(site => {

                    return site.get('id') === payload.get('id');
                });

                if (index > -1) {
                    let siteToMerge = state.get(index);
                    let updatedSite = siteToMerge.mergeDeep(payload);

                    return state.set(index, updatedSite);
                }

                return state.push(payload);
            }
            return;
        default:
            return state;
    }
}

function setup() {
    // wire up RPC
    rpc.exportAPI('beakerSitedata', beakerSitedata, { get, set });
}

function set(url, key, value) {
    let origin = extractOrigin(url);
    let sitedata = { id: origin, data: {} };

    sitedata.data[key] = value;

    return new Promise((resolve, reject) => {
        return store.dispatch(updateSiteData(sitedata));
    });
}

function get(url, key) {
    var origin = extractOrigin(url);
    let sitedata = { id: origin, key: key };

    return new Promise((resolve, reject) => {
        let site = store.getState()['sitedata'].find(site => site.get('id') === origin);

        if (site) {
            let datum = site.get('data').get(key);
            resolve(datum);
        } else {
            resolve(undefined);
        }
    });
}

function extractOrigin(originURL) {
    var urlp = url.parse(originURL);
    if (!urlp || !urlp.host || !urlp.protocol) return;
    return urlp.protocol + urlp.host + (urlp.port || '');
}

const UPDATE_SETTINGS = 'UPDATE_SETTINGS';

const { updateSettings } = reduxActions.createActions(UPDATE_SETTINGS);

const initialState$1 = immutable.Map({
	auto_update_enabled: 0,
	authMessage: 'Not attempted to connect yet'
});

function settings(state = initialState$1, action) {
	let payload = immutable.fromJS(action.payload);

	switch (action.type) {
		case UPDATE_SETTINGS:
			{
				return state.mergeDeep(payload);
			}
			return;
		default:
			return state;
	}
}

function set$1(key, value) {
	return new Promise((resolve, reject) => {
		let setter = {};
		setter[key] = value;
		store.dispatch(updateSettings(setter));
	});
}

function get$1(key) {
	return new Promise((resolve, reject) => {
		let settings = store.getState()['settings'];

		if (settings) {
			let result = settings.get(key);
			if (result) {
				resolve(settings.get(key));
			}
		} else {
			resolve('undefined');
		}
	});
}

const safeBrowserApp$1 = {
	//TODO: pull from package.json
	name: "SafeBrowser",
	id: "safe-browser",
	version: "0.4.0",
	vendor: "josh.wilson",
	permissions: ["SAFE_DRIVE_ACCESS"]
};

function reauthenticateSAFE() {

	return safeJs.auth.authorise(safeBrowserApp$1).then(tok => {
		store.dispatch(updateSettings({ 'authSuccess': true }));

		store.dispatch(updateSettings({ 'authToken': tok.token }));
		store.dispatch(updateSettings({ 'authMessage': 'Authorised with SAFE Launcher' }));
	});
	// .catch( handleAuthError )
}

function getAll() {
	return new Promise((resolve, reject) => {
		let settings = store.getState()['settings'];

		if (settings) {
			resolve(settings.toJS());
		} else {
			resolve({});
		}
	});
}

var beakerBookmarks = {
  add: 'promise',
  changeTitle: 'promise',
  changeUrl: 'promise',
  addVisit: 'promise',
  remove: 'promise',
  get: 'promise',
  list: 'promise'
};

const initialBookmarkState = immutable.List([immutable.Map({
    url: 'https://safenetforum.org/',
    title: "Safenet Forum",
    num_visits: 0
}), immutable.Map({
    url: 'safe://dir.yvette/',
    title: "SAFE Network Directory",
    num_visits: 0
})]);

const UPDATE_BOOKMARK = 'UPDATE_BOOKMARK';
const DELETE_BOOKMARK = 'DELETE_BOOKMARK';

const { updateBookmark, deleteBookmark } = reduxActions.createActions(UPDATE_BOOKMARK, DELETE_BOOKMARK);

function bookmarks(state = initialBookmarkState, action) {
    let payload = immutable.fromJS(action.payload);

    if (action.error) {
        //trigger error action
        return state;
    }

    switch (action.type) {
        case UPDATE_BOOKMARK:
            {

                let newState;
                let newBookmarks;

                let index = state.findIndex(site => {
                    return site.get('url') === payload.get('url');
                });

                if (index > -1) {
                    let siteToMerge = state.get(index);
                    let updatedSite = siteToMerge.mergeDeep(payload);

                    if (payload.get('newUrl')) {
                        updatedSite = updatedSite.set('url', payload.get('newUrl'));
                    }

                    if (payload.get('num_visits')) {
                        let newVisitCount = siteToMerge.get('num_visits') || 0;
                        newVisitCount++;
                        updatedSite = updatedSite.set('num_visits', newVisitCount);
                    }

                    return state.set(index, updatedSite);
                }

                if (payload.get('num_visits')) {
                    return state;
                }

                return state.push(payload);
            }
        case DELETE_BOOKMARK:
            {
                let index = state.findIndex(site => site.get('url') === payload.get('url'));

                return state.delete(index);
            }
        default:
            return state;
    }
}

function setup$1() {
    // wire up RPC
    rpc.exportAPI('beakerBookmarks', beakerBookmarks, { add, changeTitle, changeUrl, addVisit, remove, get: get$2, list });
}

function add(url, title) {
    return new Promise((resolve, reject) => {
        let bookmark = { url, title };
        return store.dispatch(updateBookmark(bookmark));
    });
}

function changeTitle(url, title) {

    return new Promise((resolve, reject) => {
        let bookmark = { url, title };

        return store.dispatch(updateBookmark(bookmark));
    });
}

function changeUrl(oldUrl, newUrl) {

    return new Promise((resolve, reject) => {
        let bookmark = {
            url: oldUrl,
            newUrl: newUrl };

        return store.dispatch(updateBookmark(bookmark));
    });
}

function addVisit(url) {

    let site = store.getState()['bookmarks'].find(site => site.get('url') === url);
    if (site) {
        return new Promise((resolve, reject) => {
            let bookmark = { url, num_visits: 1 };

            return store.dispatch(updateBookmark(bookmark));
        });
    } else {
        return Promise.reject('bookmark does not exist');
    }
}

function remove(url) {

    return new Promise((resolve, reject) => {
        let bookmark = { url };

        return store.dispatch(deleteBookmark(bookmark));
    });
}

function get$2(url) {

    return new Promise((resolve, reject) => {
        let site = store.getState()['bookmarks'].find(site => site.get('url') === url);

        if (site) {
            let datum = site.get('data').get(key);
            resolve(datum);
        } else {
            resolve(undefined);
        }
    });
}

function list() {

    let sites = store.getState()['bookmarks'].toJS();

    return new Promise((resolve, reject) => resolve(sites));
}

var beakerHistory = {
  addVisit: 'promise',
  getVisitHistory: 'promise',
  getMostVisited: 'promise',
  search: 'promise',
  removeVisit: 'promise',
  removeAllVisits: 'promise'
};

const BadParam = zerr('BadParam', '% must be a %');
const InvalidCmd = zerr('InvalidCommand', '% is not a valid command');

const initialHistoryState = immutable.List([immutable.Map({
    url: 'https://safenetforum.org/',
    title: "Safenet Forum",
    visits: immutable.List([]),
    last_visit: new Date()

})]);

const UPDATE_SITE = 'UPDATE_SITE';
const DELETE_SITE = 'DELETE_SITE';
const DELETE_ALL = 'DELETE_ALL';

const { updateSite, deleteSite, deleteAll } = reduxActions.createActions(UPDATE_SITE, DELETE_SITE, DELETE_ALL);

function history(state = initialHistoryState, action) {
    let payload = immutable.fromJS(action.payload);

    if (action.error) {
        return state;
    }

    switch (action.type) {
        case UPDATE_SITE:
            {
                let index = state.findIndex(site => {
                    return site.get('url') === payload.get('url');
                });

                if (index > -1) {
                    let siteToMerge = state.get(index);
                    let updatedSite = siteToMerge.mergeDeep(payload); //updates last visit, url, title
                    let lastVisit = payload.get('last_visit');
                    // // beter parsing of things that will be always there
                    if (payload.get('last_visit') && !updatedSite.get('visits').includes(lastVisit)) {
                        let updatedSiteVisits = updatedSite.get('visits').push(lastVisit);
                        updatedSite = updatedSite.set('visits', updatedSiteVisits);
                    }

                    updatedSite = updatedSite.set('last_visit', payload.get('last_visit'));

                    return state.set(index, updatedSite);
                }

                payload = payload.set('visits', immutable.List([payload.get('last_visit')]));

                return state.push(payload);
            }
        case DELETE_SITE:
            {
                let index = state.findIndex(site => site.get('url') === payload.get('url'));

                return state.delete(index);
            }

        case DELETE_ALL:
            {
                return state.clear();
            }
        default:
            return state;
    }
}

function setup$2() {
    // wire up RPC
    rpc.exportAPI('beakerHistory', beakerHistory, { addVisit: addVisit$1, getVisitHistory, getMostVisited, search, removeVisit, removeAllVisits });
}

function addVisit$1({ url, title }) {
    // each visit has a timestamp
    return new Promise((resolve, reject) => {
        let site = { url, title, last_visit: new Date() };
        return store.dispatch(updateSite(site));
    });
}

function getVisitHistory({ offset, limit }) {

    return new Promise((resolve, reject) => {
        let history = store.getState()['history'];

        let filteredHistory = history.filter((value, key) => {
            return key >= offset && key <= limit;
        });

        if (filteredHistory) {
            resolve(filteredHistory.toJS());
        } else {
            resolve(undefined);
        }
    });
}

function getMostVisited({ offset, limit }) {

    offset = offset || 0;
    limit = limit || 50;

    return getVisitHistory({ offset, limit }).then(unsortedHistory => {
        unsortedHistory.sort(function (a, b) {
            return b.visits.length - a.visits.length; //high->low ??
        });

        return unsortedHistory;
    });
}

function search(q) {
    let history = store.getState()['history'].toJS();

    let filteredHistory = history.filter((value, key) => {
        return value.url.includes(q) || value.title.includes(q);
    });

    //sort mby most should be a helper function.
    filteredHistory = filteredHistory.sort(function (a, b) {
        if (!a.visits || !b.visits) {
            return 1;
        } else {
            return b.visits.length - a.visits.length; //high->low ??
        }
    });

    return new Promise((resolve, reject) => {
        resolve(filteredHistory);
    });
}

function removeVisit(url) {
    return new Promise((resolve, reject) => {
        let site = { url };

        return store.dispatch(deleteSite(site));
    });
}

function removeAllVisits() {

    return new Promise((resolve, reject) => {
        return store.dispatch(deleteAll());
    });
}

const rootReducer = redux.combineReducers({

    bookmarks,
    history,
    settings,
    sitedata
});

const SAFE_BROWSER_STATE_FILE = 'safeBrowserData.json';

const logger = createNodeLogger({
    level: 'info',
    collapsed: true
});

let enhancer = redux.compose(redux.applyMiddleware(thunk, logger, promiseMiddleware));

let store = redux.createStore(rootReducer, enhancer);

const getTokenFromState = (state = store.getState()) => {
    let browserSettings = state['settings'];

    if (browserSettings) {
        let authToken = browserSettings.get('authToken');

        if (authToken) {
            return authToken;
        } else {
            return null;
        }
    } else {
        return null;
    }
};

const getStore = token => {
    let currentToken = token || getTokenFromState();

    if (currentToken) {
        return safeJs.nfs.getFile(currentToken, SAFE_BROWSER_STATE_FILE, 'json');
    } else {
        return Promise.reject('no token data found');
    }
};

const save = () => {
    let state = store.getState();
    let currentToken = getTokenFromState(state);

    if (currentToken) {
        let JSONToSave = JSON.stringify(state);
        return safeJs.nfs.createOrUpdateFile(currentToken, SAFE_BROWSER_STATE_FILE, JSONToSave, 'application/json').then(bool => {
            console.log("success was had saving state:  ", bool);
            return bool;
        });
    } else {
        return Promise.reject(new Error('Unable to save data to the SAFE network, as no token found'));
    }
};

const saveStore = _.debounce(save, 500);

const reStore = storeState => {
    if (storeState.errorCode) {
        return Promise.reject(storeState);
    }

    if (storeState.settings) {
        store.dispatch(updateSettings(storeState.settings));
    }

    if (storeState.sitedata) {
        dispatchForEach(storeState.sitedata, updateSiteData);
    }

    if (storeState.history) {
        dispatchForEach(storeState.history, updateSite);
    }

    if (storeState.bookmarks) {
        dispatchForEach(storeState.bookmarks, updateBookmark);
    }
};

const dispatchForEach = (array, action) => {
    array.forEach((item, key) => {
        store.dispatch(action(item));
        return;
    });
};

const handleAuthError = err => {
    store.dispatch(updateSettings({ 'authSuccess': false }));
    if (err.code === -12) {
        store.dispatch(updateSettings({ 'authMessage': 'SAFE Launcher does not appear to be open.' }));
        return;
    } else if (err.code === 'ECONNREFUSED') {
        store.dispatch(updateSettings({ 'authMessage': 'SAFE Launcher does not appear to be open.' }));
        return;
    } else if (err.statusText === 'Unauthorized') {
        store.dispatch(updateSettings({ 'authMessage': 'The browser failed to authorise with the SAFE launcher.' }));
        return;
    }

    store.dispatch(updateSettings({ 'authMessage': '' + JSON.stringify(err) }));
};

var beakerBrowser = {
  eventsStream: 'readable',
  getInfo: 'promise',
  checkForUpdates: 'promise',
  restartBrowser: 'sync',
  reauthenticateSAFE: 'promise',

  getSettings: 'promise',
  getSetting: 'promise',
  setSetting: 'promise',

  listPlugins: 'promise',
  lookupPlugin: 'promise',
  installPlugin: 'promise',
  uninstallPlugin: 'promise',

  getHomePages: 'promise',
  getProtocolDescription: 'sync',

  getDefaultProtocolSettings: 'promise',
  setAsDefaultProtocolClient: 'promise',
  removeAsDefaultProtocolClient: 'promise'
};

// globals
// =

const PLUGIN_NODE_MODULES = path.join(__dirname, 'node_modules');
console.log('[PLUGINS] Loading from', PLUGIN_NODE_MODULES);

// find all modules named beaker-plugin-*
var protocolModuleNames = [];
try {
  protocolModuleNames = fs.readdirSync(PLUGIN_NODE_MODULES).filter(name => name.startsWith('beaker-plugin-'));
} catch (e) {}

// load the plugin modules
var protocolModules = [];
var protocolPackageJsons = {};
protocolModuleNames.forEach(name => {
  // load module
  try {
    protocolModules.push(require(path.join(PLUGIN_NODE_MODULES, name)));
  } catch (e) {
    log.error('[PLUGINS] Failed to load plugin', name, e);
    return;
  }

  // load package.json
  loadPackageJson(name);
});

// exported api
// =

// fetch a complete listing of the plugin info
// - each plugin module can export arrays of values. this is a helper to create 1 list of all of them
var caches = {};
function getAllInfo(key) {
  // use cached
  if (caches[key]) return caches[key];

  // construct
  caches[key] = [];
  protocolModules.forEach(protocolModule => {
    if (!protocolModule[key]) return;

    // get the values from the module
    var values = protocolModule[key];
    if (!Array.isArray(values)) values = [values];

    // add to list
    caches[key] = caches[key].concat(values);
  });
  return caches[key];
}

// register the protocols that have standard-url behaviors
// - must be called before app 'ready'
function registerStandardSchemes() {
  var protos = getAllInfo('protocols');

  // get the protocols that are 'standard'
  var standardSchemes = protos.filter(desc => desc.isStandardURL).map(desc => desc.scheme);

  // register
  electron.protocol.registerStandardSchemes(standardSchemes);
}

// register all protocol handlers
function setupProtocolHandlers() {
  getAllInfo('protocols').forEach(proto => {
    // run the module's protocol setup
    log.debug('Registering protocol handler:', proto.scheme);
    proto.register();
  });
}

// setup all web APIs
function setupWebAPIs() {
  getAllInfo('webAPIs').forEach(api => {
    // run the module's protocol setup
    log.debug('Wiring up Web API:', api.name);
    rpc.exportAPI(api.name, api.manifest, api.methods);
  });
}

// get web API manifests for the given protocol
function getWebAPIManifests(scheme) {
  var manifests = {};

  // massage input
  scheme = scheme.replace(/:/g, '');

  // get the protocol description
  var proto = getAllInfo('protocols').find(proto => proto.scheme == scheme);
  if (!proto) return manifests;

  // collect manifests
  getAllInfo('webAPIs').forEach(api => {
    // just need to match isInternal for the api and the scheme
    if (api.isInternal == proto.isInternal) manifests[api.name] = api.manifest;
  });
  return manifests;
}

// internal methods
// =

function loadPackageJson(name) {
  var packageJson;
  try {
    packageJson = extractPackageJsonAttrs(require(path.join(PLUGIN_NODE_MODULES, name, 'package.json')));
  } catch (e) {
    packageJson = { name: name, status: 'installed' };
  }
  protocolPackageJsons[name] = packageJson;
}

function extractPackageJsonAttrs(packageJson) {
  return {
    name: packageJson.name,
    author: packageJson.author,
    description: packageJson.description,
    homepage: packageJson.homepage,
    version: packageJson.version,
    status: 'installed'
  };
}

// constants
// =

// how long between scheduled auto updates?
const SCHEDULED_AUTO_UPDATE_DELAY = 24 * 60 * 60 * 1e3; // once a day

// possible updater states
const UPDATER_STATUS_IDLE = 'idle';
const UPDATER_STATUS_CHECKING = 'checking';
const UPDATER_STATUS_DOWNLOADING = 'downloading';
const UPDATER_STATUS_DOWNLOADED = 'downloaded';

// globals
// =

// what's the updater doing?
var updaterState = UPDATER_STATUS_IDLE;
var updaterError = false; // has there been an error?

// is the updater available? must be on certain platform, and may be disabled if there's an error
var isBrowserUpdatesSupported = os.platform() == 'darwin' || os.platform() == 'win32';

// events emitted to rpc clients
var browserEvents = new EventEmitter();

// exported methods
// =

function setup$3() {
  // setup auto-updater
  try {
    if (!isBrowserUpdatesSupported) throw new Error('Disabled. Only available on macOS and Windows.');
    electron.autoUpdater.setFeedURL(getAutoUpdaterFeedURL());
    electron.autoUpdater.once('update-available', onUpdateAvailable);
    electron.autoUpdater.on('error', onUpdateError);
  } catch (e) {
    log.error('[AUTO-UPDATE]', e.toString());
    isBrowserUpdatesSupported = false;
  }
  setTimeout(scheduledAutoUpdate, 15e3); // wait 15s for first run

  // wire up RPC
  rpc.exportAPI('beakerBrowser', beakerBrowser, {
    eventsStream,
    getInfo,
    checkForUpdates,
    restartBrowser,
    reauthenticateSAFE: reauthenticateSAFE$1,
    getSetting,
    getSettings,
    setSetting,

    getProtocolDescription,
    getHomePages,

    getDefaultProtocolSettings,
    setAsDefaultProtocolClient,
    removeAsDefaultProtocolClient
  });
}

function getDefaultProtocolSettings() {
  return Promise.resolve(['http', 'dat', 'ipfs', 'view-dat'].reduce((res, x) => {
    res[x] = electron.app.isDefaultProtocolClient(x);
    return res;
  }, {}));
}

function setAsDefaultProtocolClient(protocol) {
  return Promise.resolve(electron.app.setAsDefaultProtocolClient(protocol));
}

function removeAsDefaultProtocolClient(protocol) {
  return Promise.resolve(electron.app.removeAsDefaultProtocolClient(protocol));
}

function getInfo() {
  return Promise.resolve({
    version: electron.app.getVersion(),
    platform: os.platform(),
    updater: {
      isBrowserUpdatesSupported,
      error: updaterError,
      state: updaterState
    },
    paths: {
      userData: electron.app.getPath('userData')
    }
  });
}

// this method was written, as it is, when there was an in-app plugins installer
// since it works well enough, and the in-app installer may return, Im leaving it this way
// ... but, that would explain the somewhat odd design
// -prf
function checkForUpdates() {
  // dont overlap
  if (updaterState != UPDATER_STATUS_IDLE) return;

  // track result states for this run
  var isBrowserChecking = false; // still checking?
  var isBrowserUpdated = false; // got an update?

  // update global state
  log.debug('[AUTO-UPDATE] Checking for a new version.');
  updaterError = false;
  setUpdaterState(UPDATER_STATUS_CHECKING);

  if (isBrowserUpdatesSupported) {
    // check the browser auto-updater
    // - because we need to merge the electron auto-updater, and the npm plugin flow...
    //   ... it's best to set the result events here
    //   (see note above -- back when there WAS a plugin updater, this made since -prf)
    isBrowserChecking = true;
    electron.autoUpdater.checkForUpdates();
    electron.autoUpdater.once('update-not-available', () => {
      log.debug('[AUTO-UPDATE] No browser update available.');
      isBrowserChecking = false;
      checkDone();
    });
    electron.autoUpdater.once('update-downloaded', () => {
      log.debug('[AUTO-UPDATE] New browser version downloaded. Ready to install.');
      isBrowserChecking = false;
      isBrowserUpdated = true;
      checkDone();
    });

    // cleanup
    electron.autoUpdater.once('update-not-available', removeAutoUpdaterListeners);
    electron.autoUpdater.once('update-downloaded', removeAutoUpdaterListeners);
    function removeAutoUpdaterListeners() {
      electron.autoUpdater.removeAllListeners('update-not-available');
      electron.autoUpdater.removeAllListeners('update-downloaded');
    }
  }

  // check the result states and emit accordingly
  function checkDone() {
    if (isBrowserChecking) return; // still checking

    // done, emit based on result
    if (isBrowserUpdated) {
      setUpdaterState(UPDATER_STATUS_DOWNLOADED);
    } else {
      setUpdaterState(UPDATER_STATUS_IDLE);
    }
  }

  // just return a resolve; results will be emitted
  return Promise.resolve();
}

function restartBrowser() {
  if (updaterState == UPDATER_STATUS_DOWNLOADED) {
    // run the update installer
    electron.autoUpdater.quitAndInstall();
    log.debug('[AUTO-UPDATE] Quitting and installing.');
  } else {
    log.debug('Restarting Beaker by restartBrowser()');
    // do a simple restart
    electron.app.relaunch();
    setTimeout(() => electron.app.exit(0), 1e3);
  }
}

function getSetting(key) {
  return get$1(key);
}

function reauthenticateSAFE$1() {
  return reauthenticateSAFE();
}

function getSettings() {
  return getAll();
}

function setSetting(key, value) {
  return set$1(key, value);
}

// get the home-page listing
function getHomePages() {
  return Promise.resolve(getAllInfo('homePages'));
}

// get the description for a given scheme
function getProtocolDescription(scheme) {
  // massage input
  scheme = scheme.replace(/:/g, '');

  // find desc
  return getAllInfo('protocols').find(proto => proto.scheme == scheme);
}

// rpc methods
// =

function eventsStream() {
  return emitStream(browserEvents);
}

// internal methods
// =

function setUpdaterState(state) {
  updaterState = state;
  browserEvents.emit('updater-state-changed', state);
}

function getAutoUpdaterFeedURL() {
  if (os.platform() == 'darwin') {
    return 'https://download.beakerbrowser.net/update/osx/' + electron.app.getVersion();
  } else if (os.platform() == 'win32') {
    let bits = os.arch().indexOf('64') === -1 ? 32 : 64;
    return 'https://download.beakerbrowser.net/update/win' + bits + '/' + electron.app.getVersion();
  }
}

// run a daily check for new updates
function scheduledAutoUpdate() {
  get$1('auto_update_enabled').then(v => {
    // if auto updates are enabled, run the check
    if (+v === 1) checkForUpdates();

    // schedule next check
    setTimeout(scheduledAutoUpdate, SCHEDULED_AUTO_UPDATE_DELAY);
  });
}

// event handlers
// =

function onUpdateAvailable() {
  // update status and emit, so the frontend can update
  log.debug('[AUTO-UPDATE] New version available. Downloading...');
  setUpdaterState(UPDATER_STATUS_DOWNLOADING);
}

function onUpdateError(e) {
  log.error('[AUTO-UPDATE]', e.toString());
  setUpdaterState(UPDATER_STATUS_IDLE);
  updaterError = e.toString();
  browserEvents.emit('updater-error', e.toString());
}

var manifest = {
  eventsStream: 'readable',
  getDownloads: 'promise',
  pause: 'promise',
  resume: 'promise',
  cancel: 'promise',
  remove: 'promise',
  open: 'promise',
  showInFolder: 'promise'
};

// dat-plugin is an optional internal dependency
var datPlugin;
try {
  datPlugin = require('beaker-plugin-dat');
} catch (e) {}

// exported api
// =

function setup$4() {
  // register a message-handler for setting up the client
  // - see lib/fg/import-web-apis.js
  electron.ipcMain.on('get-web-api-manifests', (event, scheme) => {
    // hardcode the beaker: scheme, since that's purely for internal use
    if (scheme == 'beaker:') {
      var protos = {
        beakerBrowser,
        beakerBookmarks,
        beakerDownloads: manifest,
        beakerHistory,
        beakerSitedata
      };
      if (datPlugin && datPlugin.webAPIs[0]) protos.datInternalAPI = datPlugin.webAPIs[0].manifest;
      event.returnValue = protos;
      return;
    }

    // for everything else, we'll use the plugins
    event.returnValue = getWebAPIManifests(scheme);
  });
}

// globals
// =

// downloads list
// - shared across all windows
var downloads = [];

// used for rpc
var downloadsEvents = new EventEmitter();

// exported api
// =

function setup$6() {
  // wire up RPC
  rpc.exportAPI('beakerDownloads', manifest, { eventsStream: eventsStream$1, getDownloads, pause, resume, cancel, remove: remove$1, open, showInFolder });
}

function registerListener(win, opts = {}) {
  const listener = (e, item, webContents) => {
    // dont touch if already being handled
    // - if `opts.saveAs` is being used, there may be multiple active event handlers
    if (item.isHandled) return;

    // build a path to an unused name in the downloads folder
    const filePath = opts.saveAs ? opts.saveAs : unusedFilename.sync(path.join(electron.app.getPath('downloads'), item.getFilename()));

    // track as an active download
    item.id = '' + Date.now() + ('' + Math.random()); // pretty sure this is collision proof but replace if not -prf
    item.name = path.basename(filePath);
    item.setSavePath(filePath);
    item.isHandled = true;
    item.downloadSpeed = speedometer();
    downloads.push(item);
    downloadsEvents.emit('new-download', toJSON(item));

    // TODO: use mime type checking for file extension when no extension can be inferred
    // item.getMimeType()

    // update dock-icon progress bar
    var lastBytes = 0;
    item.on('updated', () => {
      var sumProgress = {
        receivedBytes: getSumReceivedBytes(),
        totalBytes: getSumTotalBytes()
      };

      // track rate of download
      item.downloadSpeed(item.getReceivedBytes() - lastBytes);
      lastBytes = item.getReceivedBytes();

      // emit
      downloadsEvents.emit('updated', toJSON(item));
      downloadsEvents.emit('sum-progress', sumProgress);
      win.setProgressBar(sumProgress.receivedBytes / sumProgress.totalBytes);
    });

    item.on('done', (e, state) => {
      downloadsEvents.emit('done', toJSON(item));

      // replace entry with a clone that captures the final state
      downloads.splice(downloads.indexOf(item), 1, capture(item));

      // reset progress bar when done
      if (isNoActiveDownloads() && !win.isDestroyed()) {
        win.setProgressBar(-1);
      }

      // inform users of error conditions
      if (state === 'interrupted') {
        electron.dialog.showErrorBox('Download error', `The download of ${ item.getFilename() } was interrupted`);
      }

      if (state === 'completed') {
        // flash the dock on osx
        if (process.platform === 'darwin') {
          electron.app.dock.downloadFinished(filePath);
        }

        // optional, for one-time downloads
        if (opts.unregisterWhenDone) {
          webContents.session.removeListener('will-download', listener);
        }
      }
    });
  };

  win.webContents.session.prependListener('will-download', listener);
  win.on('close', () => win.webContents.session.removeListener('will-download', listener));
}

function download(win, url, opts) {
  // register for onetime use of the download system
  opts = Object.assign({}, opts, { unregisterWhenDone: true });
  registerListener(win, opts);
  win.webContents.downloadURL(url);
}

// rpc api
// =

function eventsStream$1() {
  return emitStream(downloadsEvents);
}

function getDownloads() {
  return Promise.resolve(downloads.map(toJSON));
}

function pause(id) {
  var download = downloads.find(d => d.id == id);
  if (download) download.pause();
  return Promise.resolve();
}

function resume(id) {
  var download = downloads.find(d => d.id == id);
  if (download) download.resume();
  return Promise.resolve();
}

function cancel(id) {
  var download = downloads.find(d => d.id == id);
  if (download) download.cancel();
  return Promise.resolve();
}

function remove$1(id) {
  var download = downloads.find(d => d.id == id);
  if (download && download.getState() != 'progressing') downloads.splice(downloads.indexOf(download), 1);
  return Promise.resolve();
}

function open(id) {
  return new Promise((resolve, reject) => {
    // find the download
    var download = downloads.find(d => d.id == id);
    if (!download || download.state != 'completed') return reject();

    // make sure the file is still there
    fs.stat(download.getSavePath(), err => {
      if (err) return reject();

      // open
      electron.shell.openItem(download.getSavePath());
      resolve();
    });
  });
}

function showInFolder(id) {
  return new Promise((resolve, reject) => {
    // find the download
    var download = downloads.find(d => d.id == id);
    if (!download || download.state != 'completed') return reject();

    // make sure the file is still there
    fs.stat(download.getSavePath(), err => {
      if (err) return reject();

      // open
      electron.shell.showItemInFolder(download.getSavePath());
      resolve();
    });
  });
}

// internal helpers
// =

// reduce down to attributes
function toJSON(item) {
  return {
    id: item.id,
    name: item.name,
    url: item.getURL(),
    state: item.getState(),
    isPaused: item.isPaused(),
    receivedBytes: item.getReceivedBytes(),
    totalBytes: item.getTotalBytes(),
    downloadSpeed: item.downloadSpeed()
  };
}

// create a capture of the final state of an item
function capture(item) {
  var savePath = item.getSavePath();
  var dlspeed = item.download;
  item = toJSON(item);
  item.getURL = () => item.url;
  item.getState = () => item.state;
  item.isPaused = () => false;
  item.getReceivedBytes = () => item.receivedBytes;
  item.getTotalBytes = () => item.totalBytes;
  item.getSavePath = () => savePath;
  item.downloadSpeed = () => dlspeed;
  return item;
}

// sum of received bytes
function getSumReceivedBytes() {
  return getActiveDownloads().reduce((acc, item) => acc + item.getReceivedBytes(), 0);
}

// sum of total bytes
function getSumTotalBytes() {
  return getActiveDownloads().reduce((acc, item) => acc + item.getTotalBytes(), 0);
}

function getActiveDownloads() {
  return downloads.filter(d => d.getState() == 'progressing');
}

// all downloads done?
function isNoActiveDownloads() {
  return getActiveDownloads().length === 0;
}

// globals
// =

var idCounter = 0;
var activeRequests = [];

// exported api
// =

function setup$7() {
  // wire up handlers
  electron.session.defaultSession.setPermissionRequestHandler(onPermissionRequestHandler);
  electron.ipcMain.on('permission-response', onPermissionResponseHandler);
}

function denyAllRequests(win) {
  // remove all requests in the window, denying as we go 
  activeRequests = activeRequests.filter(req => {
    if (req.win === win) {
      log$1('Denying outstanding permission for closing window, req #' + req.id + ' for ' + req.permission);
      req.cb(false);
      return false;
    }
    return true;
  });
}

// event handlers
// =

function onPermissionRequestHandler(webContents, permission, cb) {
  // look up the containing window
  var win = electron.BrowserWindow.fromWebContents(webContents.hostWebContents);
  if (!win) return log$1('Warning: failed to find containing window of permission request, ' + permission);

  // if we're already tracking this kind of permission request, then bundle them
  var req = activeRequests.find(req => req.win === win && req.permission === permission);
  if (req) {
    var oldCb = req.cb;
    req.cb = decision => {
      oldCb(decision);cb(decision);
    };
  } else {
    // track the new cb
    var req = { id: ++idCounter, win, permission, cb };
    activeRequests.push(req);
  }

  // send message to create the UI
  win.webContents.send('command', 'perms:prompt', req.id, webContents.id, permission);
}

function onPermissionResponseHandler(e, reqId, decision) {
  var win = e.sender;

  // lookup the cb
  var req = activeRequests.find(req => req.id == reqId);
  if (!req) return log$1('Warning: failed to find permission request for response #' + reqId);

  // untrack
  activeRequests.splice(activeRequests.indexOf(req), 1);

  // hand down the decision
  var cb = req.cb;
  cb(decision);
}

// globals
// =
var userDataDir;
var stateStoreFile = 'shell-window-state.json';
var numActiveWindows = 0;

// exported methods
// =

function setup$5() {
  // config
  userDataDir = jetpack.cwd(electron.app.getPath('userData'));

  // load pinned tabs
  electron.ipcMain.on('shell-window-ready', e => {
    // if this is the first window opened (since app start or since all windows closing)
    if (numActiveWindows === 1) {
      e.sender.webContents.send('command', 'load-pinned-tabs');
    }
  });

  // create first shell window
  return createShellWindow();
}

function createShellWindow() {
  // create window
  var { x, y, width, height } = ensureVisibleOnSomeDisplay(restoreState());
  var win = new electron.BrowserWindow({
    titleBarStyle: 'hidden-inset',
    'standard-window': false,
    x, y, width, height,
    webPreferences: {
      webSecurity: false, // disable same-origin-policy in the shell window, webviews have it restored
      allowRunningInsecureContent: false
    }
  });

  //safe filter
  let filter = {
    urls: ['http://*/*', 'https://*/*']

  };
  win.webContents.session.webRequest.onBeforeRequest(filter, (details, callback) => {
    const parsedUrl = url.parse(details.url);

    if (typeof win.webContents.isSafe === 'undefined') {
      win.webContents.isSafe = true;
    }

    if (!win.webContents.isSafe || parsedUrl.host.indexOf('localhost') === 0) {
      callback({});
      return;
    }

    if (details.url.indexOf('http') > -1) {
      callback({ cancel: true });
    }
  });

  //extra shortcuts outside of menus
  electronLocalshortcut__default.register(win, 'Alt+D', () => {
    if (win) win.webContents.send('command', 'file:open-location');
  });

  store.subscribe(e => {
    saveStore();
    win.webContents.send('safeStore-updated');
  });

  registerListener(win);
  loadURL(win, 'beaker:shell-window');
  numActiveWindows++;

  // register shortcuts
  for (var i = 1; i <= 9; i++) electronLocalshortcut.register(win, 'CmdOrCtrl+' + i, onTabSelect(win, i - 1));
  electronLocalshortcut.register(win, 'Ctrl+Tab', onNextTab(win));
  electronLocalshortcut.register(win, 'Ctrl+Shift+Tab', onPrevTab(win));

  // register event handlers
  win.on('scroll-touch-begin', sendToWebContents('scroll-touch-begin'));
  win.on('scroll-touch-end', sendToWebContents('scroll-touch-end'));
  win.on('focus', sendToWebContents('focus'));
  win.on('blur', sendToWebContents('blur'));
  win.on('enter-full-screen', sendToWebContents('enter-full-screen'));
  win.on('leave-full-screen', sendToWebContents('leave-full-screen'));
  win.on('close', onClose(win));

  return win;
}

// internal methods
// =

function loadURL(win, url) {
  win.loadURL(url);
  log$1('Opening', url);
}

function getCurrentPosition(win) {
  var position = win.getPosition();
  var size = win.getSize();
  return {
    x: position[0],
    y: position[1],
    width: size[0],
    height: size[1]
  };
}

function windowWithinBounds(windowState, bounds) {
  return windowState.x >= bounds.x && windowState.y >= bounds.y && windowState.x + windowState.width <= bounds.x + bounds.width && windowState.y + windowState.height <= bounds.y + bounds.height;
}

function restoreState() {
  var restoredState = {};
  try {
    restoredState = userDataDir.read(stateStoreFile, 'json');
  } catch (err) {
    // For some reason json can't be read (might be corrupted).
    // No worries, we have defaults.
  }
  return Object.assign({}, defaultState(), restoredState);
}

function defaultState() {
  var bounds = electron.screen.getPrimaryDisplay().bounds;
  var width = Math.max(800, Math.min(1800, bounds.width - 50));
  var height = Math.max(600, Math.min(1200, bounds.height - 50));
  return Object.assign({}, {
    x: (bounds.width - width) / 2,
    y: (bounds.height - height) / 2,
    width,
    height
  });
}

function ensureVisibleOnSomeDisplay(windowState) {
  var visible = electron.screen.getAllDisplays().some(display => windowWithinBounds(windowState, display.bounds));
  if (!visible) {
    // Window is partially or fully not visible now.
    // Reset it to safe defaults.
    return defaultState(windowState);
  }
  return windowState;
}

function onClose(win) {
  return e => {
    numActiveWindows--;

    // deny any outstanding permission requests
    denyAllRequests(win);

    // unregister shortcuts
    electronLocalshortcut.unregisterAll(win);

    // save state
    // NOTE this is called by .on('close')
    // if quitting multiple windows at once, the final saved state is unpredictable
    if (!win.isMinimized() && !win.isMaximized()) {
      var state = getCurrentPosition(win);
      userDataDir.write(stateStoreFile, state, { atomic: true });
    }
  };
}

// shortcut event handlers
// =

function onTabSelect(win, tabIndex) {
  return () => win.webContents.send('command', 'set-tab', tabIndex);
}

function onNextTab(win) {
  return () => win.webContents.send('command', 'window:next-tab');
}
function onPrevTab(win) {
  return () => win.webContents.send('command', 'window:prev-tab');
}

// window event handlers
// =

function sendToWebContents(event) {
  return e => e.sender.webContents.send('window-event', event);
}

var darwinMenu = {
  label: 'Beaker',
  submenu: [{ label: 'About Beaker', role: 'about' }, { type: 'separator' }, { label: 'Services', role: 'services', submenu: [] }, { type: 'separator' }, { label: 'Hide Beaker', accelerator: 'Command+H', role: 'hide' }, { label: 'Hide Others', accelerator: 'Command+Alt+H', role: 'hideothers' }, { label: 'Show All', role: 'unhide' }, { type: 'separator' }, { label: 'Quit', accelerator: 'Command+Q', click() {
      electron.app.quit();
    } }]
};

var fileMenu = {
  label: 'File',
  submenu: [{
    label: 'New Tab',
    accelerator: 'CmdOrCtrl+T',
    click: function (item, win) {
      if (win) win.webContents.send('command', 'file:new-tab');
    }
  }, {
    label: 'New Window',
    accelerator: 'CmdOrCtrl+N',
    click: function () {
      createShellWindow();
    }
  }, {
    label: 'Reopen Closed Tab',
    accelerator: 'CmdOrCtrl+Shift+T',
    click: function (item, win) {
      if (win) win.webContents.send('command', 'file:reopen-closed-tab');
    }
  }, {
    label: 'Toggle SAFE Browsing',
    checked: true,
    accelerator: 'CmdOrCtrl+Shift+L',
    click: function (item, win) {
      if (win) win.webContents.send('command', 'window:toggle-safe-mode');
    }
  }, {
    label: 'Open File',
    accelerator: 'CmdOrCtrl+O',
    click: function (item, win) {
      if (win) {
        electron.dialog.showOpenDialog({ title: 'Open file...', properties: ['openFile', 'createDirectory'] }, files => {
          if (files && files[0]) win.webContents.send('command', 'file:new-tab', 'file://' + files[0]);
        });
      }
    }
  }, {
    label: 'Open Location',
    accelerator: 'CmdOrCtrl+L',
    click: function (item, win) {
      if (win) win.webContents.send('command', 'file:open-location');
    }
  }, { type: 'separator' }, {
    label: 'Close Window',
    accelerator: 'CmdOrCtrl+Shift+W',
    click: function (item, win) {
      if (win) win.close();
    }
  }, {
    label: 'Close Tab',
    accelerator: 'CmdOrCtrl+W',
    click: function (item, win) {
      if (win) win.webContents.send('command', 'file:close-tab');
    }
  }]
};

var editMenu = {
  label: 'Edit',
  submenu: [{ label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" }, { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" }, { type: "separator" }, { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" }, { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" }, { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" }, { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }, {
    label: "Find in Page",
    accelerator: "CmdOrCtrl+F",
    click: function (item, win) {
      if (win) win.webContents.send('command', 'edit:find');
    }
  }]
};

var viewMenu = {
  label: 'View',
  submenu: [{
    label: 'Reload',
    accelerator: 'CmdOrCtrl+R',
    click: function (item, win) {
      if (win) win.webContents.send('command', 'view:reload');
    }
  }, {
    label: 'Hard Reload (Clear Cache)',
    accelerator: 'CmdOrCtrl+Shift+R',
    click: function (item, win) {
      if (win) win.webContents.send('command', 'view:hard-reload');
    }
  }, { type: "separator" }, {
    label: 'Zoom In',
    accelerator: 'CmdOrCtrl+=',
    click: function (item, win) {
      if (win) win.webContents.send('command', 'view:zoom-in');
    }
  }, {
    label: 'Zoom Out',
    accelerator: 'CmdOrCtrl+-',
    click: function (item, win) {
      if (win) win.webContents.send('command', 'view:zoom-out');
    }
  }, {
    label: 'Actual Size',
    accelerator: 'CmdOrCtrl+0',
    click: function (item, win) {
      if (win) win.webContents.send('command', 'view:zoom-reset');
    }
  }, { type: "separator" }, {
    label: 'Toggle DevTools',
    accelerator: 'Alt+CmdOrCtrl+I',
    click: function (item, win) {
      if (win) win.webContents.send('command', 'view:toggle-dev-tools');
    }
  }]
};

var historyMenu = {
  label: 'History',
  role: 'history',
  submenu: [{
    label: 'Back',
    accelerator: 'CmdOrCtrl+Left',
    click: function (item, win) {
      if (win) win.webContents.send('command', 'history:back');
    }
  }, {
    label: 'Forward',
    accelerator: 'CmdOrCtrl+Right',
    click: function (item, win) {
      if (win) win.webContents.send('command', 'history:forward');
    }
  }]
};

var windowMenu = {
  label: 'Window',
  role: 'window',
  submenu: [{
    label: 'Minimize',
    accelerator: 'CmdOrCtrl+M',
    role: 'minimize'
  }, {
    label: 'Close',
    accelerator: 'CmdOrCtrl+Q',
    role: 'close'
  }, {
    label: 'Next Tab',
    accelerator: 'CmdOrCtrl+]',
    click: function (item, win) {
      if (win) win.webContents.send('command', 'window:next-tab');
    }
  }, {
    label: 'Previous Tab',
    accelerator: 'CmdOrCtrl+[',
    click: function (item, win) {
      if (win) win.webContents.send('command', 'window:prev-tab');
    }
  }]
};
if (process.platform == 'darwin') {
  windowMenu.submenu.push({
    type: 'separator'
  });
  windowMenu.submenu.push({
    label: 'Bring All to Front',
    role: 'front'
  });
}

var beakerDevMenu = {
  label: 'BeakerDev',
  submenu: [{
    label: 'Reload Shell-Window',
    click: function () {
      electron.BrowserWindow.getFocusedWindow().webContents.reloadIgnoringCache();
    }
  }, {
    label: 'Toggle Shell-Window DevTools',
    click: function () {
      electron.BrowserWindow.getFocusedWindow().toggleDevTools();
    }
  }, {
    label: 'Toggle WebSecurity for new tabs',
    click: function (item, win) {
      if (win) win.webContents.send('command', 'window:disable-web-security');
    }
  }]
};

function buildWindowMenu(env) {
  var menus = [fileMenu, editMenu, viewMenu, historyMenu, windowMenu];
  if (process.platform === 'darwin') menus.unshift(darwinMenu);
  if (env.name !== 'production') menus.push(beakerDevMenu);
  return menus;
}

function registerContextMenu() {
  // register the context menu on every created webContents
  electron.app.on('web-contents-created', (e, webContents) => {
    webContents.on('context-menu', (e, props) => {
      var menuItems = [];
      const { mediaFlags, editFlags } = props;
      const hasText = props.selectionText.trim().length > 0;
      const can = type => editFlags[`can${ type }`] && hasText;

      // get the focused window, ignore if not available (not in focus)
      // - fromWebContents(webContents) doesnt seem to work, maybe because webContents is often a webview?
      var targetWindow = electron.BrowserWindow.getFocusedWindow();
      if (!targetWindow) return;

      // ignore clicks on the shell window
      if (props.pageURL == 'beaker:shell-window') return;

      // helper to call code on the element under the cursor
      const callOnElement = js => {
        webContents.executeJavaScript(`
          var el = document.elementFromPoint(${ props.x }, ${ props.y })
          ${ js }
        `);
      };

      // helper to run a download prompt for media
      const downloadPrompt = (item, win) => {
        var defaultPath = path.join(electron.app.getPath('downloads'), path.basename(props.srcURL));
        electron.dialog.showSaveDialog({ title: `Save ${ props.mediaType } as...`, defaultPath }, filepath => {
          if (filepath) download(win, props.srcURL, { saveAs: filepath });
        });
      };

      // links
      if (props.linkURL && props.mediaType === 'none') {
        menuItems.push({ label: 'Open Link in New Tab', click: (item, win) => win.webContents.send('command', 'file:new-tab', props.linkURL) });
        menuItems.push({ label: 'Copy Link Address', click: () => electron.clipboard.writeText(props.linkURL) });
        menuItems.push({ type: 'separator' });
      }

      // images
      if (props.mediaType == 'image') {
        menuItems.push({ label: 'Save Image As...', click: downloadPrompt });
        menuItems.push({ label: 'Copy Image', click: () => webContents.copyImageAt(props.x, props.y) });
        menuItems.push({ label: 'Copy Image URL', click: () => electron.clipboard.writeText(props.srcURL) });
        menuItems.push({ label: 'Open Image in New Tab', click: (item, win) => win.webContents.send('command', 'file:new-tab', props.srcURL) });
        menuItems.push({ type: 'separator' });
      }

      // videos and audios
      if (props.mediaType == 'video' || props.mediaType == 'audio') {
        menuItems.push({ label: 'Loop', type: 'checkbox', checked: mediaFlags.isLooping, click: () => callOnElement('el.loop = !el.loop') });
        if (mediaFlags.hasAudio) menuItems.push({ label: 'Muted', type: 'checkbox', checked: mediaFlags.isMuted, click: () => callOnElement('el.muted = !el.muted') });
        if (mediaFlags.canToggleControls) menuItems.push({ label: 'Show Controls', type: 'checkbox', checked: mediaFlags.isControlsVisible, click: () => callOnElement('el.controls = !el.controls') });
        menuItems.push({ type: 'separator' });
      }

      // videos
      if (props.mediaType == 'video') {
        menuItems.push({ label: 'Save Video As...', click: downloadPrompt });
        menuItems.push({ label: 'Copy Video URL', click: () => electron.clipboard.writeText(props.srcURL) });
        menuItems.push({ label: 'Open Video in New Tab', click: (item, win) => win.webContents.send('command', 'file:new-tab', props.srcURL) });
        menuItems.push({ type: 'separator' });
      }

      // audios
      if (props.mediaType == 'audio') {
        menuItems.push({ label: 'Save Audio As...', click: downloadPrompt });
        menuItems.push({ label: 'Copy Audio URL', click: () => electron.clipboard.writeText(props.srcURL) });
        menuItems.push({ label: 'Open Audio in New Tab', click: (item, win) => win.webContents.send('command', 'file:new-tab', props.srcURL) });
        menuItems.push({ type: 'separator' });
      }

      // clipboard
      if (props.isEditable) {
        menuItems.push({ label: 'Cut', role: 'cut', enabled: can('Cut') });
        menuItems.push({ label: 'Copy', role: 'copy', enabled: can('Copy') });
        menuItems.push({ label: 'Paste', role: 'paste', enabled: editFlags.canPaste });
        menuItems.push({ type: 'separator' });
      } else if (hasText) {
        menuItems.push({ label: 'Copy', role: 'copy', enabled: can('Copy') });
        menuItems.push({ type: 'separator' });
      }

      // inspector
      menuItems.push({ label: 'Inspect Element', click: item => {
          webContents.inspectElement(props.x, props.y);
          if (webContents.isDevToolsOpened()) webContents.devToolsWebContents.focus();
        } });

      // protocol
      var urlp = url.parse(props.frameURL || props.pageURL);
      var pdesc = getProtocolDescription(urlp.protocol);
      if (pdesc && pdesc.contextMenu && Array.isArray(pdesc.contextMenu)) {
        menuItems.push({ type: 'separator' });
        pdesc.contextMenu.forEach(item => {
          menuItems.push({
            label: item.label,
            click: (_, win) => item.click(win, props)
          });
        });
      }

      // show menu
      var menu = electron.Menu.buildFromTemplate(menuItems);
      menu.popup(targetWindow);
    });
  });
}

function setup$8() {
  electron.protocol.registerFileProtocol('beaker', (request, cb) => {
    // FIXME
    // if-casing every possible asset is pretty dumb
    // generalize this
    // -prf

    // browser ui
    if (request.url == 'beaker:shell-window') return cb(path.join(__dirname, 'shell-window.html'));
    if (request.url == 'beaker:shell-window.js') return cb(path.join(__dirname, 'shell-window.build.js'));
    if (request.url == 'beaker:shell-window.css') return cb(path.join(__dirname, 'stylesheets/shell-window.css'));

    // builtin pages
    for (let slug of ['start', 'favorites', 'archives', 'history', 'downloads', 'settings']) {
      if (request.url == `beaker:${ slug }`) return cb(path.join(__dirname, 'builtin-pages.html'));
    }
    if (request.url.startsWith('beaker:site/')) return cb(path.join(__dirname, 'builtin-pages.html'));
    if (request.url == 'beaker:builtin-pages.js') return cb(path.join(__dirname, 'builtin-pages.build.js'));
    if (request.url == 'beaker:builtin-pages.css') return cb(path.join(__dirname, 'stylesheets/builtin-pages.css'));

    // common assets
    if (request.url == 'beaker:font') return cb(path.join(__dirname, 'fonts/photon-entypo.woff'));
    if (request.url.startsWith('beaker:logo')) return cb(path.join(__dirname, 'img/logo.png'));

    return cb(-6);
  }, e => {
    if (e) console.error('Failed to register beaker protocol', e);
  });
}

function setup$9() {
  // load default favicon
  var defaultFaviconBuffer = -6; // not found, till we load it
  fs.readFile(path.join(__dirname, './img/default-favicon.ico'), (err, buf) => {
    if (err) console.log('Failed to load default favicon', path.join(__dirname, '../../img/default-favicon.ico'), err);
    if (buf) defaultFaviconBuffer = buf;
  });

  // load logo favicon
  var logoBuffer = -6; // not found, till we load it
  fs.readFile(path.join(__dirname, './img/logo-favicon.png'), (err, buf) => {
    if (err) console.log('Failed to load logo favicon', path.join(__dirname, '../../img/logo.png'), err);
    if (buf) logoBuffer = buf;
  });

  // register favicon protocol
  electron.protocol.registerBufferProtocol('beaker-favicon', (request, cb) => {
    var url = request.url.slice('beaker-favicon:'.length);

    // special case
    if (url == 'beaker') return cb(logoBuffer);

    // look up in db
    get(url, 'favicon').then(data => {
      if (data) {
        // `data` is a data url ('data:image/png;base64,...')
        // so, skip the beginning and pull out the data
        data = data.split(',')[1];
        if (data) return cb(new Buffer(data, 'base64'));
      }
      cb(defaultFaviconBuffer);
    }).catch(err => cb(defaultFaviconBuffer));
  }, e => {
    if (e) console.error('Failed to register beaker-favicon protocol', e);
  });
}

var queue = [];
var commandReceiver;

function setup$10() {
  electron.ipcMain.once('shell-window-ready', function (e) {
    commandReceiver = e.sender;
    queue.forEach(url => commandReceiver.send('command', 'file:new-tab', url));
    queue.length = 0;
  });
}

function open$1(url) {
  if (commandReceiver) {
    commandReceiver.send('command', 'file:new-tab', url);
  } else {
    queue.push(url);
  }
}

// import packageJson from './package.json'
var packageJson = require('./package.json');

console.log("packagejson");

const safeBrowserApp = {
    name: packageJson.name,
    id: packageJson.name,
    version: packageJson.version,
    vendor: packageJson.author.name,
    permissions: ["SAFE_DRIVE_ACCESS"]
};

// // configure logging
log.setLevel('trace');

// load the installed protocols
registerStandardSchemes();

electron.app.on('ready', function () {

    let token = safeJs.auth.authorise(safeBrowserApp).then(tok => {
        store.dispatch(updateSettings({ 'authSuccess': true }));
        store.dispatch(updateSettings({ 'authToken': tok.token }));
        store.dispatch(updateSettings({ 'authMessage': 'Authorised with SAFE Launcher' }));

        getStore(tok.token).then(json => {
            reStore(json);
        }).catch(err => {
            if (err.status === 404) {
                store.dispatch(updateSettings({ 'authMessage': 'Authorised with SAFE Launcher' }));
            } else {

                store.dispatch(updateSettings({ 'authMessage': 'Problems getting browser settings from the network, ' + err.staus + ', ' + err.statusText }));
            }
        });
    }).catch(handleAuthError);

    // API initialisations
    setup();
    setup$1();
    setup$2();

    // base
    setup$3();

    // ui
    electron.Menu.setApplicationMenu(electron.Menu.buildFromTemplate(buildWindowMenu(env$1)));
    registerContextMenu();
    setup$5();
    setup$6();
    setup$7();

    // protocols
    setup$8();
    setup$9();
    setupProtocolHandlers();

    // web APIs
    setup$4();
    setupWebAPIs();

    // listen OSX open-url event
    setup$10();
});

electron.app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') electron.app.quit();
});

electron.app.on('open-url', function (e, url) {
    open$1(url);
});
}());
//# sourceMappingURL=background-process.build.js.map