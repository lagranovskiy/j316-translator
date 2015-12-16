var async = require('neo-async');
var langMap = require('../../config/langMap');
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
         *@param lookupJobArray [{bookId:'Ps', part: 'ot', chapterId: 2, verseStart:1, verseEnd:2}]
         * @param targetLang targetLang
         */
        verseQueue: async.queue(function (lookupJobArray, targetLanguage, callback) {

                _.each(lookupJobArray, function (verseJob) {

                    var damId = langMap[targetLanguage].dam[verseJob.part];
                    if (!damId) {
                        damId = langMap.default.dam[verseJob.part];
                    }

                    dbt.getVersInLang(damId, verseJob.bookId, verseJob.chapterId, verseJob.verseStart, verseJob.verseEnd,
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

            }, 5
        ),

        /**
         * Prepare verse lookup. Get from till values for the request to the worker
         * @param  senderLanguage en/de/ru,
         * @param verse Mathaus 1,2-7
         * @param callback
         */
        prepareVerseLookup: function (senderLanguage, verse, callback) {
            refParser.parseOSIS(senderLanguage, verse, function (err, refInfoArray) {
                if (!refInfoArray || refInfoArray.length == 0) {
                    return callback('VerseWorker :: no parsing of verse possible');
                }

                var retVal = [];
                /**
                 * 1 Mo 1,3, 2Mo 2.3 -> refInfoArray[2]
                 */
                _.each(refInfoArray, function (bibleRef) {

                    _.each(bibleRef.entities, function (bibleRefPart) {

                        var partStartBook = bibleRefPart.start.b;
                        var partStartChapter = bibleRefPart.start.c;
                        var partStartVerse = bibleRefPart.start.v;

                        var partEndBook = bibleRefPart.end.b;
                        var partEndChapter = bibleRefPart.end.c;
                        var partEndVerse = bibleRefPart.end.v;

                        if (partStartBook !== partEndBook) {
                            console.error('Illegal verse reference; ' + verse);
                            callback('Illegal verse reference; ' + verse);
                        }

                        var bookOrderArray = refParser.getMetaInfo(senderLanguage).order;
                        var part = 'nt';
                        if (bookOrderArray['Matt'] > bookOrderArray[partStartBook]) {
                            part = 'ot';
                        }

                        var bookVerseMap = refParser.getMetaInfo(senderLanguage).chapters;
                        var bookVerseArray = bookVerseMap[partStartBook];


                        // At a time we can lookup only x verses for one chapter in one book. We need to separate the reference into this parts and fetch them separately.
                        // For example. Ps. 3,2-4,7 need to be fetched to 3,2-12, 4,1-7
                        for (var i = 0; i < (partEndChapter - partStartChapter) + 1; i++) {
                            var currentChapter = partStartChapter + i;

                            var chapterEndVerse = bookVerseArray[currentChapter - 1];
                            var chapterStartVerse = 1;

                            if (currentChapter === partStartChapter) {
                                chapterStartVerse = partStartVerse
                            }

                            if (currentChapter === partEndChapter) {
                                chapterEndVerse = partEndVerse
                            }

                            retVal.push(
                                {
                                    bookId: partStartBook,
                                    part: part,
                                    chapterId: currentChapter,
                                    verseStart: chapterStartVerse,
                                    verseEnd: chapterEndVerse
                                }
                            );
                        }
                    });

                });

                callback(null, retVal);
            });
        }
    };

    return worker;
};

module.exports = translationWorker();