var assert = require('assert');
var Async = require('../lib/async.js');
var currentTime = new Date();
currentTime = currentTime.toLocaleDateString() + ' ' + currentTime.toLocaleTimeString();

describe("Testing series calls",function () {
    var async = new Async();

    var expectedOrder = ['series0','series1','series2', 'series3','seriesComplete'];
    var actualOrder = [];

    it("Should run in order of: " + expectedOrder, function (done){
        async.next(function series0 (next) {
            assert.equal(0,actualOrder.push('series0') -1,'series0 should be index 0');
            next();
        });

        async.next(function series1 (next) {
            assert.equal(1,actualOrder.push('series1') -1,'series1 should be index 1');
            next();
        });

        async.next(function series2 (next) {
            assert.equal(2,actualOrder.push('series2') -1,'series2 should be index 2');
            next();
        });

        async.next(function series3 (next) {
            assert.equal(3,actualOrder.push('series3') -1,'series3 should be index 3');
            next();
        });

        async.next.start(function seriesComplete () {
            assert.equal(4,actualOrder.push('seriesComplete') -1,'seriesComplete should be index 4');
            assert.deepEqual(actualOrder,expectedOrder,"actualOrder should match")

            done();
        });
    });

});

describe("Testing parallel calls", function(){
    var async = new Async();
    var path = require('path'), fs = require('fs');
    var filesToUpdate = [], filesUpdated = [], i;

    //build file array to use as test update
    for (i=0; i < 3; i++) {
        filesToUpdate.push({path: path.join(__dirname,'../examples/files/file' + (i + 1) + '.txt'), text: 'Updating Data for file: ' + (i + 1) + ' at ' + currentTime});
    }

    it("should update all files from filesToUpdate and add path filesUpdated for testing.  Order doesn't matter.", function (done) {
        //now run async update
        for (i=0; i < filesToUpdate.length; i++){
            async.now(function (next, file) {
                fs.writeFile(file.path,file.text, function(err){
                    filesUpdated.push(file)
                    next();
                });
            }, filesToUpdate[i]);
        }

        async.now.start(function(){
            var n, found;
            for (i=0; i < filesToUpdate.length; i++){
                for (n=0; n < filesUpdated.length; n++){
                    if (filesToUpdate[i].path === filesUpdated[n].path) {found = true; break;}
                }

                assert.ok(found,"Doesn't look like we have all the files.  async.now doesn't seem to work.")
            }

            done();
        });
    });
});

describe("Using series and parallel combined and nested.", function(){
    var async = new Async(), i;

    var expectedOuterSeries = ['series0', 'series1', 'series2'];
    var actualOuterSeries = [];
    var expectedInnerSeries = ['series1Nested0', 'series1Nested1', 'series1Nested2'];
    var actualInnerSeries = [];

    describe("Building Outer Layer of async.next calls", function (){
        async.next(function series0 (next){


            it("Should handle nested async.next in order.  Then call next outer async.next", function () {
                //starting a nested async.next will require all nested async calls to complete before the outer async.next will continue;
                async.next(function series1Nested0(next){

                    assert.equal(actualOuterSeries[0],'series0',"We shouldn't get to our nested async.next until the outer async.next has called it's next callback")

                    actualInnerSeries.push('series1Nested0');
                    next();
                });

                async.next(function series1Nested1(next){
                    actualInnerSeries.push('series1Nested1');
                    next();
                });

                async.next(function series1Nested2(next){
                    actualInnerSeries.push('series1Nested2');

                    for (i=0; i < expectedInnerSeries.length;i++){
                        assert.equal(actualInnerSeries[i], expectedInnerSeries[i],"Our nested async.next should be called in the same order as defined.")
                    }
                    //calling next() on the last nested async.next will resume the outer async.next
                    next();
                });

                //all nested async.next or async.now calls are started on nextTick.  That means their parent function will complete before they start.
                assert.equal(actualOuterSeries.push('series0') -1,0,"Our outer async.next should be called in the same order that it is defined.");
                //calling the outer async.next after adding nested async.next calls will start them - the outer async.next will continue after the last nested async.next has been called.
                next();
            });
        });

        async.next(function series1 (next){
            describe("Should handle nested async.now and continue to the next outer async.next when all async.now callbacks have finished.", function(){
                var path = require('path'), fs = require('fs');
                var filesToUpdate = [], filesUpdated = [], i;

                //build file array to use as test update
                for (i=0; i < 3; i++) {
                    filesToUpdate.push({path: path.join(__dirname,'../examples/files/file' + (i + 1) + '.txt'), text: 'Updating Data for file: ' + (i + 1) + ' at ' + currentTime});
                }

                it("should update all files from filesToUpdate and add path filesUpdated for testing.  Order doesn't matter.", function (done) {
                    //now run async update
                    for (i=0; i < filesToUpdate.length; i++){
                        async.now(function (next, file) {

                            assert.equal(actualOuterSeries[1],'series1','The outer async.next should finish before the first async.now is called.');

                            fs.writeFile(file.path,file.text, function(){
                                filesUpdated.push(file);
                                next();
                            });
                        }, filesToUpdate[i]);
                    }

                    async.now.start(function(){
                        var n, found;
                        for (i=0; i < filesToUpdate.length; i++){
                            for (n=0; n < filesUpdated.length; n++){
                                if (filesToUpdate[i].path === filesUpdated[n].path) {found = true; break;}
                            }

                            assert.ok(found,"Doesn't look like we have all the files.  async.now doesn't seem to work.")
                        }
                        done();
                        //calling next here will continue to the next outer async.next
                        next();
                    });
                });

                //all nested async.next or async.now calls are started on nextTick.  That means their parent function will complete before they start.
                assert.equal(actualOuterSeries.push('series1') -1,1,"Our outer async.next should be called in the same order that it is defined.");
            });
        });

        async.next(function series2 (next){
            assert.equal(actualOuterSeries.push('series2') -1,2,"Our outer async.next should be called in the same order that it is defined.");
            next();
        });

        async.next.start(function(){
            for (i=0; i < expectedOuterSeries.length; i++){
                assert.equal(actualOuterSeries[i],expectedOuterSeries[i],"The outer async.next should be called in the order they were defined.")
            }
        });
    });

});;