var async = require('neo-async');
var dbt = require('./connectors/DbtConnector');
var _ = require('underscore');

var refParser = require('../common/ReferenceParser');

/**
 * Adapter implementation to process verse lookup
 */
var translationWorker = function () {

    var worker = {


        /**
         * Translation Queue.
         *
         *@param lookupJobArray [{damId:'ANETNN2NO', bookId:'Ps', chapterId: 2, verseStart:1, verse_end:2}]
         * @param targetLang targetLang
         */
        verseQueue: async.queue(function (lookupJobArray, targetLanguage, callback) {

            _.each(lookupJobArray, function (verseJob) {

                dbt.getVersInLang(verseJob.damId, verseJob.bookId, verseJob.chapterId, verseJob.verseStart, verseJob.verse_end,
                    function (error, translatedObject) {
                        if (error) {
                            return callback('Cannot process verse lookup to ' + targetLanguage + ' : ' + error);
                        }
                        if (translatedObject.length == 0) {
                            return callback('No lookup possible for lang ' + targetLanguage + JSON.stringify(verseJob));
                        }

                        var lookupText = _.pluck(translatedObject, 'verse_text').join('\n');
                        var maxVerse = _.max(translatedObject, function (vers) {
                            return vers.verse_id;
                        });
                        var minVerse = _.max(translatedObject, function (vers) {
                            return vers.verse_id;
                        });

                        var versLocation = translatedObject[0].book_name + ' ' + translatedObject[0].chapter_id + '.';
                        if (maxVerse != minVerse) {
                            versLocation += minVerse + '-' + maxVerse;
                        } else {
                            versLocation += minVerse;
                        }

                        var lookupRs = {
                            verse: lookupText,
                            location: versLocation,
                            language: targetLanguage
                        };

                        return callback(null, lookupRs);
                    });
            });

        }, 5),

        /**
         * Prepare verse lookup. Get from till values for the request to the worker
         * @param  senderLang en/de/ru
         * @param vers Mathaus 1.2-7
         * @param callback
         */
        prepareVerseLookup: function (senderLang, vers, callback) {
            refParser.parseOSIS(senderLang, vers, function (err, refInfoArray) {
                if (!refInfoArray || refInfoArray.length == 0) {
                    return callback('VerseWorker :: no parsing of verse possible');
                }

                var refInfo = refInfoArray[0];
                /**
                 *    should(refInfo[0].entities.length).be.exactly(2);
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
                 */

            });
        }
    };

    return worker;
};

module.exports = translationWorker();