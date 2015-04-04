var CallbackManager = function ( type ) {
    type = type || 'series';
    
    var manager = this;
    manager.counter = 0;
    manager.callbacks = []; //either parallel or series callback
    manager.params = [];  //params used for parallel callbacks
    manager.done = function () { }; //final callback
    manager.status = 0; // 0= 'not started', 1= 'running' 2='idle'
    manager.type = type;
    manager.run = type == 'series' ? manager.series : manager.parallel;    
};

CallbackManager.prototype.series = function () {
    var manager = this, next;
    manager.status = 1;
    next = function () {
        var callback = manager.callbacks.shift( ), args;
        if ( typeof callback != 'function' ) { manager.status = 2; if ( typeof manager.done == 'function' ) { manager.done( ); } return }
        
        //if we got here then we have another callback to execute
        args = Array.prototype.slice.call( arguments );
        args.unshift( next );  //pass the next function as the first param
        //callback.apply( this, args );
        callOnNext( callback, args, this );
    };
    
    next( );
};

var callOnNext = function ( callback, args, context ) {
    process.nextTick( function () { 
        callback.apply( context || callback, args );
    } );
};

CallbackManager.prototype.parallel = function () {
    var manager = this, next, args, i;
    manager.status = 1;
    next = function () {
        manager.counter--;
        if ( manager.counter == 0 ) { manager.status = 2; if (typeof manager.done == 'function' ) { manager.done( ); } return }

    };
        
    while ( manager.callbacks.length ) {         
        args = manager.params.shift();
        args.unshift( next );
        callOnNext( manager.callbacks.shift(), args );
    }
            
};

module.exports = CallbackManager;