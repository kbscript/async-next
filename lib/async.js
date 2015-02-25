var CallbackManager = require( './callbackmanager.js' );
var Async = function ( options ) {
    options = options || {};
    var async = this;
    //array of all callback managers loaded by async 1 index is root series manager 0 = parallel manager        
    async.managers = [new CallbackManager( 'parallel' ), new CallbackManager( 'series' )];
    async.now = function () {
        var async = this, args = Array.prototype.slice.call( arguments );
        var callback = args.shift( );
        if ( typeof callback != 'function' ) { throw new Error( "The first argument must be a callback function.  All other arguments will be passed to the callback." ); }
        
        async.managers[0].counter++;
        async.managers[0].callbacks.push( callback );
        async.managers[0].params.push( args );
        
        //if we are already running then we need to start each call as they come in to add to existing now callback
        if ( async.managers[0].status == 1 ) { async.managers[0].run( ); }
    };
    async.now.manager = async.managers[0];
    async.now.start = start;
    
    async.next = function ( callback ) {
        if ( typeof callback != 'function' ) { throw new Error( "The first argument must be a callback function.  All other arguments will be passed to the callback." ); }        ;
        
        //default current series manager to last manager
        var i = async.managers.length - 1, manager = async.managers[i];
        
        if ( async.managers[i].status != 1 ) { return manager.callbacks.push( callback ); }
        
        //else there is already a series manager running, then we'll create a new one and and push it to async.managers
        //now all calls to async.next(function) will push to the new manager until - the current callback running on the prior async.next is compete
        //then this new series will start and call all functions added in order when compete it will continure the previous callbacks.
        manager = new CallbackManager( 'series' );
        manager.callbacks.push( callback );
        async.managers.push( manager );
        async.managers[i].callbacks.unshift( function ( next ) {
            manager.status = 1;
            manager.done = function () {
                async.managers.pop( );
                next( )
            };
            manager.run( );
        } );
    };
    async.next.start = start;
    async.next.manager = async.managers[1];

};

var start = function ( callback ) {
    var manager = this.manager;
    if ( typeof callback == 'function' ) { manager.done = callback; }
    if ( manager.status != 1 ) {
        manager.status = 1;
        manager.run( );
    }
};

module.exports = Async;