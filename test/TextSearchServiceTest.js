var service = require('../app/service/TextSearchService');
var should = require('should');

describe("Text search service functionality", function () {
    describe("Test search service lookup", function () {

        it("Test prepareVerseLookup Joh. 3,16-18", function (done) {

            var request = {body: {query: "800"}};
            var response = {
                send: function (data) {
                    should(data != null).be.ok();
                    done();
                }
            };

            service.searchText(request, response, null);

        });


    });


})
;