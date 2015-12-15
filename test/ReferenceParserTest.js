var refParser = require('../app/common/ReferenceParser');
var should = require('should');

describe("Test reference parser", function () {

    it("Test Ps. 3.17", function (done) {

        refParser.parseOSIS('de', 'Ps. 3.17', function (err, refInfo, osis) {
            should(err == null).be.ok();
            should(refInfo.length).be.exactly(1);
            should(refInfo[0]).have.property('entities');
            should(refInfo[0].entities.length).be.exactly(1);
            should(refInfo[0].entities[0].start.b).be.exactly('Ps');
            should(refInfo[0].entities[0].start.c).be.exactly(3);
            should(refInfo[0].entities[0].start.v).be.exactly(17);
            should(refInfo[0].entities[0].end.b).be.exactly('Ps');
            should(refInfo[0].entities[0].end.c).be.exactly(3);
            should(refInfo[0].entities[0].end.v).be.exactly(17);

            done();
        });

    });

    it("Test Psalm 3.17", function (done) {

        refParser.parseOSIS('de', 'Psalm 3.17', function (err, refInfo, osis) {
            should(err == null).be.ok();
            should(refInfo.length).be.exactly(1);
            should(refInfo[0]).have.property('entities');
            should(refInfo[0].entities.length).be.exactly(1);
            should(refInfo[0].entities[0].start.b).be.exactly('Ps');
            should(refInfo[0].entities[0].start.c).be.exactly(3);
            should(refInfo[0].entities[0].start.v).be.exactly(17);
            should(refInfo[0].entities[0].end.b).be.exactly('Ps');
            should(refInfo[0].entities[0].end.c).be.exactly(3);
            should(refInfo[0].entities[0].end.v).be.exactly(17);
            console.info(JSON.stringify(refInfo[0].entities[0]));

            done();
        });

    });

    it("Test Psalm 3.17-19", function (done) {

        refParser.parseOSIS('de', 'Psalm 3.17-19', function (err, refInfo, osis) {
            should(err == null).be.ok();
            should(refInfo.length).be.exactly(1);
            should(refInfo[0]).have.property('entities');
            should(refInfo[0].entities.length).be.exactly(2);
            should(refInfo[0].entities[0].start.b).be.exactly('Ps');
            should(refInfo[0].entities[0].start.c).be.exactly(3);
            should(refInfo[0].entities[0].start.v).be.exactly(17);
            should(refInfo[0].entities[0].end.b).be.exactly('Ps');
            should(refInfo[0].entities[0].end.c).be.exactly(3);
            should(refInfo[0].entities[0].end.v).be.exactly(17);

            should(refInfo[0].entities[1].start.b).be.exactly('Ps');
            should(refInfo[0].entities[1].start.c).be.exactly(3);
            should(refInfo[0].entities[1].start.v).be.exactly(19);
            should(refInfo[0].entities[1].end.b).be.exactly('Ps');
            should(refInfo[0].entities[1].end.c).be.exactly(3);
            should(refInfo[0].entities[1].end.v).be.exactly(19);

            console.info(JSON.stringify(refInfo[0].entities[0]));

            done();
        });

    });

    it("Test Psalm 3.17-4.2", function (done) {

        refParser.parseOSIS('de', 'Psalm 3.17-4.2', function (err, refInfo, osis) {
            should(err == null).be.ok();
            should(refInfo.length).be.exactly(1);
            should(refInfo[0]).have.property('entities');
            should(refInfo[0].entities.length).be.exactly(2);
            should(refInfo[0].entities[0].start.b).be.exactly('Ps');
            should(refInfo[0].entities[0].start.c).be.exactly(3);
            should(refInfo[0].entities[0].start.v).be.exactly(17);
            should(refInfo[0].entities[1].end.b).be.exactly('Ps');
            should(refInfo[0].entities[1].end.c).be.exactly(4);
            should(refInfo[0].entities[1].end.v).be.exactly(2);
            console.info(JSON.stringify(refInfo[0].entities[0]));

            done();
        });

    });

    it("Test 1 Mose 6.2, 2 Mose 1.1", function (done) {

        refParser.parseOSIS('de', '1 Mose 6.2, 2 Mose 1.1', function (err, refInfo, osis) {
            should(err == null).be.ok();
            should(refInfo.length).be.exactly(1);
            should(refInfo[0]).have.property('entities');
            should(refInfo[0].entities.length).be.exactly(2);
            should(refInfo[0].entities[0].start.b).be.exactly('Gen');
            should(refInfo[0].entities[0].start.c).be.exactly(6);
            should(refInfo[0].entities[0].start.v).be.exactly(2);
            should(refInfo[0].entities[1].end.b).be.exactly('Exod');
            should(refInfo[0].entities[1].end.c).be.exactly(1);
            should(refInfo[0].entities[1].end.v).be.exactly(1);
            console.info(JSON.stringify(refInfo[0].entities[0]));

            done();
        });

    });

    it("Test Ps 3:17, 4:2", function (done) {

        refParser.parseOSIS('de', 'Ps 3:17-19', function (err, refInfo, osis) {
            should(err == null).be.ok();
            should(refInfo.length).be.exactly(1);
            should(refInfo[0]).have.property('entities');
            should(refInfo[0].entities.length).be.exactly(2);
            should(refInfo[0].entities[0].start.b).be.exactly('Ps');
            should(refInfo[0].entities[0].start.c).be.exactly(3);
            should(refInfo[0].entities[0].start.v).be.exactly(17);
            should(refInfo[0].entities[1].end.b).be.exactly('Ps');
            should(refInfo[0].entities[1].end.c).be.exactly(3);
            should(refInfo[0].entities[1].end.v).be.exactly(19);
            console.info(JSON.stringify(refInfo[0].entities[0]));

            done();
        });

    });


});