var async = require('neo-async');
var _ = require('underscore');
var EventEmitter = require("events").EventEmitter;
var NodeCache = require("node-cache");
var uuid = require('node-uuid');
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
}

/**
 * Service distributor provides the connection between business logic and clients communication
 */
var serviceDistributor = _.extend(new EventEmitter(), {

    msgCache: new NodeCache({stdTTL: 60 * 30, checkperiod: 120}),

    languageList: {},


    /**
     * Requests translation of a given text. As far the translation is ready, it will be emitted for the listeners
     * @param text
     * @param sourceLanguage
     * @param translationSource person submitted the message
     */
    requestTranslation: function (text, sourceLanguage, translationSource) {
        console.info('Translating: ' + text);
        var timestamp = new Date().getTime();


        _.each(this.languageList, function (numConsumers, language) {
            if (numConsumers <= 0 ) {
                return false;
            }

            translationWorker.translationQueue.push({
                text: text,
                sourceLanguage: sourceLanguage,
                targetLanguage: language,

            }, function (err, translation) {
                if (err) {
                    return console.error('Problem by the translation of ' + language + ':' + err);
                }

                console.info('Translation completed: ' + language);

                var translationRs = {
                    translation: translation,
                    sourceLanguage: sourceLanguage,
                    targetLanguage: language,
                    sourceName: translationSource,
                    timestamp: timestamp
                };

                cacheMsg(language, translationRs);

                serviceDistributor.emit('translationReady', translationRs);

                console.info('Translation emitted to language ' + language);
            }, this);
        });
    },

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
    },

    /**
     * Adds a language to translation language list
     * @param language
     */
    addTranslationLanguage: function (language) {
        if (!language) {
            console.error('Cannot add consumer for illegal language ' + language);
            return;
        }
        if (!this.languageList[language]) {
            this.languageList[language] = 0;
        }
        this.languageList[language] = this.languageList[language] + 1;

        console.info('Service :: Consumer registered. There are currently ' + this.languageList[language] + ' consumers for ' + language + ' language.');
    },


    /**
     * Removes language consument from the language list. The language is only removed if no consumers are registered
     * @param language
     */
    removeTranslationLanguage: function (language) {
        if (!language) {
            console.error('Cannot remove consumer for illegal language ' + language);
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


    }
});
module.exports = serviceDistributor;