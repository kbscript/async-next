var Async = require( '../index.js' );


var MyClass = function (params) {
    var async = new Async( );
    var myclass = this;
    
    params = params || {};

    myclass.done = params.callback || function () { throw new Error( "No callback defined." ); };

    async.next( function ( next ) { step1( next ); } );
    async.next( function ( next ) { step2( next ); } );
    async.next.start( function ( ) { myclass.done( "", "Passed." ); } );
};

MyClass.prototype.then = function ( callback ) {
    if ( typeof callback != "function" ) { throw new Error( "You must pass a function as a parameter." ); }
    this.done = callback;
};

var step1 = function (next) { console.log( "step1 complete" ); next( ); };

var step2 = function ( next ) { console.log( "step2 complete" ); next( ); };

console.log( "create class" );
var myclass = new MyClass( );
console.log( "Set callback" );
myclass.then( function (err, result) {
    if ( err ) { throw new Error( err ); }

    console.log( result );
} );
console.log( "Now calling steps in class." );