var Util = require( 'util' );

var forEachTest = function () { 

};

var forEach = module.exports = function ( list, callback ) {
    var args = Array.prototype.slice.call( arguments );
    
    var _callback = args.pop( ), _list = args.shift( );
    if ( typeof _callback !== "function" ) { throw new Error( "A callback is required as the last argument passed" ); }
    
    if ( typeof _list !== "object" ) { throw new Error( "An array or an object must be the first argument passed." ); }
    
    var i, prop
    var send = function ( item, i ) {
        args.unshift( i );
        args.unshift( _list[i] );
        _callback.apply( _list, args );
    };
    
    if ( Util.isArray( _list ) ) {
        for ( i = 0; i < _list.length; i++ ) { send( _list[i], i ); }
        return;
    }
    
    for ( prop in _list ) { send( _list[prop], prop ); }
};