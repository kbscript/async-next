var forEach = require( '../lib/foreach.js' );

var list = [123, 345, 5656, 676, 878, 9, 12];
var objList = {id:2, name:"Caleb", type: "contact"};
var secondObject = { id: 1, name: "Kevin" };
var thirdObject = ["1", "2", "3", "4"];
var forthObject = "Kevin Barnett";
var fifthObject = 1234;
var callback = function ( item, index, secondobject, third, forth, fifth ) { 
    console.log( item );
};

forEach( list, secondObject, thirdObject, forthObject, fifthObject, callback );
forEach( objList, secondObject, thirdObject, forthObject, fifthObject, callback );

//these should fail
var tryCatch = function () {
    try { 
        forEach.apply(undefined, arguments );  
    }
    catch ( error ) { 
        console.log( error );
    }
}

tryCatch( "I'm a bad list", callback );
tryCatch( list, "I'm a bad callback" );