var main = function ( request, response ) {
    var Async = require( '../index.js' );
    var async = new Async( );
    
    async.next( function test1( next ) {
        setTimeout( function ( next ) {
            console.log( "test1" );
            
            async.next( function test1Inner1( next ) {
                //inner test
                setTimeout( function ( next ) {
                    console.log( "test1Inner1" );
                    next( "testing callback function" );
                }, 1000, next )
            } );
            
            async.next( function test1Inner2( next, param1 ) {
                //inner test
                setTimeout( function ( next ) {
                    console.log( "test1Inner2" );
                    var TestValue = 'Kevin';
                    
                    //run a loop to simulate sub parallel db calls based on result from 
                    //these will all run before moving to the test1Inner3 series function
                    for ( var i = 0; i < 10; i++ ) {
                        async.now( function ( next, TestValue, i, endLoop ) {
                            TestValue += "_" + i;
                            var sql = "Select ID, Team_Name From Team Where ID = @ID";
                            mssql( sql, { ID: i + 10000 }, function ( err, result ) {
                                console.log( "i: " + i );
                                console.log( "TestValue" + TestValue );
                                
                                next( );
                            } );//end function query
                        }, TestValue, i, 10 );
                    }                    ;//end for loop
                    
                    //to start the parallel functions need to run async.now.start and pass callback function
                    //here I'm passing next which will continue the series steps.
                    async.now.start( next );
                }, 1000, next )
            } );
            
            
            async.next( function test1Inner3( next ) {
                //inner test
                setTimeout( function ( next ) {
                    console.log( "test1Inner3" );
                    var TestValue = 'Kevin';
                    
                    //run a loop to simulate sub parallel db calls based on result from 
                    //these will all run before moving to the test1Inner3 series function
                    for ( var i = 0; i < 10; i++ ) {
                        async.now( function ( next, TestValue, i, endLoop ) {
                            TestValue += "_" + i;
                            var sql = "Select ID, Team_Name From Team Where ID = @ID";
                            mssql( sql, { ID: i + 10000 }, function ( err, result ) {
                                console.log( "i: " + i );
                                console.log( "TestValue" + TestValue );
                                
                                next( );
                            } );//end function query
                        }, TestValue, i, 10 );
                    }                    ;//end for loop
                    async.now.start( next );
                }, 1000, next )
            } );
            
            next( );
        }, 1000, next )
    } );
    
    async.next( function test2( next ) {
        setTimeout( function ( next ) {
            console.log( "test2" );
            //test loop data a second time for parallel calls
            
            //run a loop to simulate sub parallel db calls based on result from 
            //these will all run before moving to the test1Inner3 series function
            var callLoopDataWithParam = function ( i ) {
                //simulate different db times
                var timeout = 10000 - ( i * 1000 );
                if ( i == 2 || i == 4 ) timeout = 0
                
                async.now( function ( next ) {
                    //test timeout
                    setTimeout( function ( next ) {
                        console.log( "parallel " + i );
                        if ( i == 5 ) {
                            //add one more parallel funciton to test inner layer call
                            async.now( function parallelInner( next ) {
                                console.log( "parallel Inner " );
                                
                                next( );
                            } );//end inner asyncNow
                        }                        ;//end if
                        
                        next( );
                    }, timeout, next );
                } );
            };//end callLoopDataWithParam
            
            for ( var i = 0; i < 10; i++ ) {                                
                callLoopDataWithParam( i );
            }//end for loop

            
            async.now.start( next );
        }, 1000, next )
    } );
    
    async.next( function test3( next ) {
        setTimeout( function ( next ) {
            console.log( "test3" );
            next( );
        }, 1000, next )
    } );
    
    async.next( function test4( next ) {
        setTimeout( function ( next ) {
            console.log( "test4" );
            next( );
        }, 1000, next )
    } );   
    
    async.next.start( function testWrapup( data ) {
        console.log( "Done" );        
    } );//end function
};//end function main
var mssql = function ( sql, params, callback) {
    var data = [{ name: 'Kevin Barnett', email: 'kevinbarnett5506@gmail.com' }, { name: 'John Doe', email: 'jdoe@test.com' }];
    process.nextTick( function () { 
        callback(null, data );
    } );
};
main( );