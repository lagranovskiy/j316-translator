var async = require('neo-async');
var _ = require('underscore');
var EventEmitter = require("events").EventEmitter;
var NodeCache = require("node-cache");
var bibleVerseWorker = require('../provider/BibleVerseWorker');
var util = require('util');
var translationWorker = require('../provider/TranslationWorker');

/**
 * Stores the msg to the cache.
 * @param key
 * @param msg
 */
function cacheMsg(key, msg) {
    var msgArray = serviceDistributor.msgCache.get(key);
    if (!msgArray) {
        msgArray = [];
    }
    msgArray.push(msg);
    serviceDistributor.msgCache.set(key, msgArray);
    serviceDistributor.renewLastActivity();
}


/**
 * Extracts () separated verses from given text
 * @param text text to be evaluated
 * @return array of verses in ()
 */
function extractVerses(text) {
    if (!text) {
        return null;
    }
    var re = /\(([^()]*)\)/g;
    var retVal = [];
    _.each(text.match(re), function (vers) {
        retVal.push(vers.replace(/[()]/g, ''))
    });
    return retVal;
}


/**
 * Service distributor provides the connection between business logic and clients communication
 */
var serviceDistributor = _.extend(new EventEmitter(), {

    msgCache: new NodeCache({stdTTL: 60 * 180, checkperiod: 120}),

    languageList: {},

    lastMessageDate: new Date().getTime(),


    /**
     * Returns the timestamp of the last activity or 0 is no activity in memory
     * @returns {*}
     */
    getLastActivity: function () {
        if (this.lastMessageDate == null) {
            return 0;
        }
        return this.lastMessageDate;
    },


    /**
     * Renew Last activity with current timestamp
     */
    renewLastActivity: function () {
        this.lastMessageDate = new Date().getTime();
    },

    /**
     * Requests translation of a given text. As far the translation is ready, it will be emitted for the listeners
     * @param text
     * @param sourceLanguage
     * @param translationSource person submitted the message
     * @param cb cb
     */
    requestTranslation: function (text, sourceLanguage, translationSource) {
        if (!text) {
            console.error('Service :: Cannot request a translation of null');
            return;
        }
        text = text.trim();

        // Notify protocol
        serviceDistributor.emit('newText', {
            timestamp: new Date().getTime(),
            text: text,
            sourceLanguage: sourceLanguage,
            translationSource: translationSource
        });

        console.info('Service :: Translating: ' + sourceLanguage + ' : ' + text);
        var timestamp = new Date().getTime();

        // Find out if there are any bible verses in the original text.
        // If yes, they also need to be lookup'ed separately as a job on bibleVerseWorker
        var verseArray = extractVerses(text);

        // Iterate over array of verses
        _.each(verseArray, function (verse) {
            async.waterfall([
                    /**
                     * Call preparation of verse lookup
                     * @param callback
                     */
                        function (callback) {

                        bibleVerseWorker.prepareVerseLookup(sourceLanguage, verse, callback);
                    },
                    /**
                     * Push prepared jobs for every language to the job queue
                     *
                     * @param verseArray   [{bookId:'Ps', part: 'ot', chapterId: 2, verseStart:1, verseEnd:2}]
                     * @param callback
                     */
                        function (verseArray, callback) {

                        var langTranslationMap = {};
                        async.forEachOf(serviceDistributor.languageList, function (numConsumers, language, callback) {
                            if (numConsumers <= 0) {
                                return callback(null, []);
                            }

                            bibleVerseWorker.verseQueue.push({
                                verse: verse,
                                targetLanguage: language,
                                verseJobs: verseArray
                            }, function (err, langLookupResult) {
                                /* {
                                 *   targetLanguage: 'tr',
                                 *   verseArray: [{verse: 'There comes the text',  location: 'Ps. 1,1'}]
                                 * }
                                 * */
                                if (err) {
                                    return callback(err);
                                }

                                langTranslationMap[langLookupResult.targetLanguage] = langLookupResult.verseArray;
                                return callback();
                            });
                        }, function (err) {
                            // We transfer the result of the step: map with lang>versArray
                            return callback(err, langTranslationMap);
                        });

                    }
                ],

                /**
                 * Finally Process lookup'ed verses
                 * @param langTranslationMap
                 * { en: [{verse: 'There comes the text',  location: 'Ps. 1,1'}],
                 *   de: [{verse: 'There comes the text',  location: 'Ps. 1,1'}] ... }
                 *
                 * @param err error if any
                 */
                function (err, langTranslationMap) {
                    if (err) {
                        return console.info('Service :: Problem by lookup of verse :' + verse + ' : ' + err);
                    }
                    _.each(langTranslationMap, function (lookupedVerseArray, language) {
                        _.each(lookupedVerseArray, function (singleVers) {
                            console.info('Service :: Verse ' + singleVers.location + ' lookup completed');

                            var translationRs = {
                                translation: '\"' + singleVers.verse + '\" (' + singleVers.location + ')',
                                sourceLanguage: sourceLanguage,
                                targetLanguage: language,
                                sourceName: 'Holy Bible',
                                contentType: 'verse',
                                timestamp: timestamp
                            };

                            cacheMsg(language, translationRs);

                            serviceDistributor.emit('translationReady', translationRs);

                            console.info('Service :: Verse lookup emitted to language ' + language);
                        });
                    });
                }
            );

        });

        // If The text is only a single verse reference, than we do not need to translate it separately.
        if (verseArray.length === 1 && verseArray[0].length === (text.length - 2)) {
            return;
        }

        _.each(this.languageList, function (numConsumers, language) {
            if (numConsumers <= 0) {
                return false;
            }

            translationWorker.translationQueue.push({
                text: text,
                sourceLanguage: sourceLanguage,
                targetLanguage: language
            }, function (err, translation) {
                if (err) {
                    return console.error('Service :: Problem by the translation of ' + language + ':' + err);
                }

                console.info('Service :: Translation completed: ' + language);

                var translationRs = {
                    translation: translation,
                    sourceLanguage: sourceLanguage,
                    targetLanguage: language,
                    sourceName: translationSource,
                    contentType: 'translation',
                    timestamp: timestamp
                };

                cacheMsg(language, translationRs);

                serviceDistributor.emit('translationReady', translationRs);

                console.info('Service :: Translation emitted to language ' + language);
            });
        });
    }
    ,

    /**
     * Returns the cached message array for the given language
     * @param languageKey
     * @returns {Array} of msgs
     */
    getCachedMessages: function (languageKey) {
        var retVal = this.msgCache.get(languageKey);

        if (!retVal) {
            return [];
        }

        return retVal;
    }
    ,

    /**
     * Adds a language to translation language list
     * @param language
     */
    addTranslationLanguage: function (language) {
        if (!language) {
            console.error('Service :: Cannot add consumer for illegal language ' + language);
            return;
        }
        if (!this.languageList[language]) {
            this.languageList[language] = 0;
        }
        this.languageList[language] = this.languageList[language] + 1;

        serviceDistributor.emit('listenersChanged', this.languageList);
        console.info('Service :: Consumer registered. There are currently ' + this.languageList[language] + ' consumers for ' + language + ' language.');
    }
    ,


    /**
     * Removes language consument from the language list. The language is only removed if no consumers are registered
     * @param language
     */
    removeTranslationLanguage: function (language) {
        if (!language) {
            console.error('Service ::Cannot remove consumer for illegal language ' + language);
            return;
        }
        if (this.languageList[language] && this.languageList[language] > 0) {
            this.languageList[language] = this.languageList[language] - 1;
            console.info('Service :: Consumer removed. There are currently ' + this.languageList[language] + ' consumers for ' + language + ' language.');
        }
        // Remove language from used lang list
        if (this.languageList[language] && this.languageList[language] === 0) {
            this.languageList = _.omit(this.languageList, language);
        }

        serviceDistributor.emit('listenersChanged', this.languageList);

    }
})
    ;
module.exports = serviceDistributor;