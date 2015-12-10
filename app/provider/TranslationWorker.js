var async = require('neo-async');
var ya = require('./connectors/YandexConnector');

/**
 * Adapter implementation to process language translations
 */
var translationWorker = function () {

    var worker = {
        /**
         * Translation Queue.
         *
         * translationJob need to have following properties:
         * sourceLanguage, targetLanguage, text.
         *
         * Callbacked Response is a simple String
         * Here parallel message translation be controlled
         */
        translationQueue: async.queue(function (translationJob, callback) {

            if (translationJob.sourceLanguage === translationJob.targetLanguage) {
                return callback(null, translationJob.text);
            }

            ya.translate(translationJob.text, translationJob.sourceLanguage, translationJob.targetLanguage, function (error, translatedText) {
                if (error) {
                    return callback('Cannot process translation to ' + translationJob.targetLanguage + error);
                }
                return callback(null, translatedText);
            });
        }, 5)


    };

    return worker;
};

module.exports = translationWorker();