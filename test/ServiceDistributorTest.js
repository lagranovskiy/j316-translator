var distributor = require('../app/business/ServiceDistributor');
var should = require('should');
var sinon = require('sinon');

describe("Test Service Distributor functionality", function () {


    distributor.addTranslationLanguage('en');
    distributor.addTranslationLanguage('ru');
    distributor.addTranslationLanguage('ar');

    it("Test Verse lookup", function (done) {
        var testText = 'Hello here is a interesting test from (Ps.3,3) and what about (Exodus 5)? Sometimes (Matt. 4,1-4) says more that a lot of words. \n (Lk 3,3)';
        distributor.requestTranslation(testText, 'de', 'Tester');
        var spy = sinon.spy();

        distributor.on('translationReady', spy);

        setTimeout(function () {
            should(spy.callCount).be.exactly(4*3+3);
            done();
        }, 1000)

    });


});