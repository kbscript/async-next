var Async = require('../lib/async.js');


//Testing series calls
var series = function () {
    var async = new Async();

    async.next(function (next) {
        var count = 0;
        console.log('doing step 1');
        count++;
        next({value: "new value"}, count);
    });

    async.next(function (next, paramsFromFirstAsyncNext, count) {
        console.log('doing step 2');
        console.log('using passed params: ' + paramsFromFirstAsyncNext.value + " count: " + count);
        next();
    });

    async.next.start(function () {
        console.log('All done.\n\n');
        parallel();
    });
};

//Testing parallel calls
var parallel = function () {
    var async = new Async();
    var path = require('path'), fs = require('fs');
    var filesToUpdate = [], i;

    //build file array to use as test update
    for (i=0; i < 3; i++) {
        filesToUpdate.push({path: path.join(__dirname,'./files/file' + (i + 1) + '.txt'), text: 'New Test Data for file: ' + (i + 1)})
    }

    //now run async update
    for (i=0; i < filesToUpdate.length; i++){
        async.now(function (next, file) {
            fs.writeFile(file.path,file.text, function(){
                console.log('done updating file: ' + file.path);
                next();
            });
        }, filesToUpdate[i]);
    }

    async.now.start(function(){
        console.log('done with nested async.now\n\n');
        combined();
    });

};

//Using series and parallel combined and nested.
var combined = function() {
    var async = new Async();

    async.next(function series1 (next){


        //starting a nested async.next will require all nested async calls to complete before the outer async.next will continue;
        async.next(function series1Nested1(next){
            console.log('done with series1Nested1');
            next();
        });

        async.next(function series1Nested2(next){
            console.log('done with series1Nested2');
            next();
        });

        async.next(function series1Nested3(next){
            console.log('done with series1Nested3');

            //calling next() on the last nested async.next will resume the outer async.next
            next();
        });

        //all nested async.next or async.now calls are started on nextTick.  That means their parent function will complete before they start.
        console.log('done with series1');
        //calling the outer async.next after adding nested async.next calls will start them - the outer async.next will continue after the last nested async.next has been called.
        next();
    });

    async.next(function series2 (next){
        var path = require('path'), fs = require('fs');
        var filesToUpdate = [], i;

        //build file array to use as test update
        for (i=0; i < 3; i++) {
            filesToUpdate.push({path: path.join(__dirname,'./files/file' + (i + 1) + '.txt'), text: 'New Test Data for file: ' + (i + 1)})
        }

        //now run async update
        for (i=0; i < filesToUpdate.length; i++){
            async.now(function (next, file) {
                fs.writeFile(file.path,file.text, function(){
                    console.log('done updating file: ' + file.path);
                    next();
                });
            }, filesToUpdate[i]);
        }

        async.now.start(function(){
            console.log('done with nested async.now');

            //we need to call the outer next callback for the series2 function to continue our outer async.next series.
            next();
        });

        //all nested async.next or async.now calls are started on nextTick.  That means their parent function will complete before they start.
        console.log('done with series2');
    });

    async.next(function series3 (next){
        console.log('done with series3');
        next();
    });

    async.next.start(function(){
        console.log('all done with combined example.\n\n');
    });
};

//start tests
series();