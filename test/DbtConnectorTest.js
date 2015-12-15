var dbtConnector = require('../app/provider/connectors/DbtConnector');
var should = require('should');

describe("Test DBT Connection", function () {

    it("Test Communication", function (done) {

        dbtConnector.getVersInLang('ENGKJVO2ET', 'Ps', 2, 1, 2, function (err, data) {
            should(err == null).be.ok();
            should(data.length).be.exactly(2);
            console.info(data);
            done();
        });

    });


});