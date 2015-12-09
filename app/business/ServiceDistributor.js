var async = require('neo-async');
var _ = require('underscore');
var EventEmitter = require("events").EventEmitter;
util = require('util');

var serviceDistributor = new EventEmitter();

serviceDistributor.languageList = {};

serviceDistributor.translationQueue = async.queue(function (translationJob, callback) {
    callback(null, translationJob.text + ' translated to ' + translationJob.targetLanguage);
}, 5);

/**
 * Requests translation of a given text. As far the translation is ready, it will be emitted for the listeners
 * @param text
 * @param sourceLanguage
 */
serviceDistributor.requestTranslation = function (text, sourceLanguage) {
    console.info('Translating: ' + text);
    var timestamp = new Date().getTime();

    // In case there are someone listening in the lang equaling the source lang of the sender
    if (this.languageList[sourceLanguage] && this.languageList[sourceLanguage] > 0) {
        serviceDistributor.emit('translationReady', {
            translation: text,
            sourceLanguage: sourceLanguage,
            targetLanguage: sourceLanguage,
            timestamp: timestamp
        });
    }


    _.each(this.languageList, function (numConsumers, language) {
        if (numConsumers <= 0 || language === sourceLanguage) {
            return false;
        }

        serviceDistributor.translationQueue.push({
            text: text,
            sourceLanguage: sourceLanguage,
            targetLanguage: language
        }, function (err, translation) {
            if (err) {
                return console.error('Problem by the translation of ' + language + ':' + err);
            }

            console.info('Translation completed: ' + language);
            serviceDistributor.emit('translationReady', {
                translation: translation,
                sourceLanguage: sourceLanguage,
                targetLanguage: language,
                timestamp: timestamp
            });

            console.info('Translation emitted to language ' + language);
        }, this);
    });
};


/**
 * Adds a language to translation language list
 * @param language
 */
serviceDistributor.addTranslationLanguage = function (language) {
    if (!language) {
        console.error('Cannot add consumer for illegal language ' + language);
        return;
    }
    if (!this.languageList[language]) {
        this.languageList[language] = 0;
    }
    this.languageList[language] = this.languageList[language] + 1;

    console.info('Service :: Consumer registered. There are currently ' + this.languageList[language] + ' consumers for ' + language + ' language.');

    // remove it
    this.requestTranslation('Wow im a text that need to be translated.', 'ru');
};


/**
 * Removes language consument from the language list. The language is only removed if no consumers are registered
 * @param language
 */
serviceDistributor.removeTranslationLanguage = function (language) {
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


};

module.exports = serviceDistributor;