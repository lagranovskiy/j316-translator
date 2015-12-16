var worker = require('../app/provider/BibleVerseWorker');
var should = require('should');

describe("Test Verse worker functionality", function () {
    describe("Test vers preparation", function () {

        it("Test prepareVerseLookup Joh. 3,16-18", function (done) {
            // prepareVerseLookup: function (senderLanguage, verse, callback)
            worker.prepareVerseLookup('de', 'Joh. 3,16-18', function (err, data) {
                should(err == null).be.ok();
                should(data.length).be.exactly(1);
                // {bookId:'Ps', part: 'ot', chapterId: 2, verseStart:1, verse_end:2}
                should(data[0].bookId).be.exactly('John');
                should(data[0].part).be.exactly('nt');
                should(data[0].chapterId).be.exactly(3);
                should(data[0].verseStart).be.exactly(16);
                should(data[0].verseEnd).be.exactly(18);
                done();
            });

        });

        it("Test prepareVerseLookup illegal value Ps. 3,2-22", function (done) {
            // prepareVerseLookup: function (senderLanguage, verse, callback)
            worker.prepareVerseLookup('de', 'Ps. 3,2-22', function (err, data) {
                should(err == null).be.ok();
                should(data.length).be.exactly(1);
                // {bookId:'Ps', part: 'ot', chapterId: 2, verseStart:1, verse_end:2}
                should(data[0].bookId).be.exactly('Ps');
                should(data[0].part).be.exactly('ot');
                should(data[0].chapterId).be.exactly(3);
                should(data[0].verseStart).be.exactly(2);
                should(data[0].verseEnd).be.exactly(9);
                done();
            });

        });

        it("Test prepareVerseLookup sequence value Ps. 3,2-4,22", function (done) {
            // prepareVerseLookup: function (senderLanguage, verse, callback)
            worker.prepareVerseLookup('de', 'Ps. 3,2-4,22', function (err, data) {
                should(err == null).be.ok();
                should(data.length).be.exactly(2);
                // {bookId:'Ps', part: 'ot', chapterId: 2, verseStart:1, verse_end:2}
                should(data[0].bookId).be.exactly('Ps');
                should(data[0].part).be.exactly('ot');
                should(data[0].chapterId).be.exactly(3);
                should(data[0].verseStart).be.exactly(2);
                should(data[0].verseEnd).be.exactly(9);

                should(data[1].bookId).be.exactly('Ps');
                should(data[1].part).be.exactly('ot');
                should(data[1].chapterId).be.exactly(4);
                should(data[1].verseStart).be.exactly(1);
                should(data[1].verseEnd).be.exactly(9);
                done();
            });

        });
    });

    describe("Test vers lookup", function () {
        it("Test Communication", function (done) {
            done();

        });
    });

});