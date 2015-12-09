var async = require('neo-async');

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

            callback(null, translationJob.text + ' translated to ' + translationJob.targetLanguage);
        }, 5)


    };

    return worker;
};

module.exports = translationWorker();