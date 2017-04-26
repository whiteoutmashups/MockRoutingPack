const { protocol } = require('electron')
const url = require('url')


var _safeHandler = function(req, cb)
{
    const parsed = url.parse(req.url);
    
    if( ! parsed.host )
    return;
    
    const tokens = parsed.host.split('.');
    // We pretend there are only 2 pieces
    // TODO: be more strict here
    const service = tokens.length > 1 ? tokens[0] : 'www';
    const domain = tokens.length > 1 ? tokens[1] : tokens[0];
    const path = ( parsed.pathname !==  '/' && parsed.pathname !==  null ) ? parsed.pathname.split('/').slice(1).join('/') : 'index.html';
    const newUrl = `http://localhost:8100/dns/${service}/${domain}/${encodeURIComponent(decodeURIComponent(path))}`;
    
    console.log( "New SAFE url", newUrl );
    cb({ url: newUrl });
}

const registerSafeProtocol = function () 
{
    console.log( "registering SAFE Network Protocols" );
    // setup the protocol handler
    protocol.registerHttpProtocol('safe', _safeHandler, err => {
        
        if (err)
        throw ProtocolSetupError(err, 'Failed to create protocol: safe')
    } )

}



module.exports = {
    scheme: 'safe',
    label: 'SAFE Network',
    isStandardURL: true,
    isInternal: true,
    register: registerSafeProtocol
}
