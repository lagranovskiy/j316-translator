var config = require('../../../config/config');
var translate = require('yandex-translate')(config.keys.yandexTranslate.yandex_api_key);

/**
 * Yandex Translation API
 *
 * {"dirs":["az-ru","be-bg","be-cs","be-de","be-en","be-es","be-fr","be-it","be-pl","be-ro","be-ru","be-sr","be-tr","bg-be","bg-ru","bg-uk","ca-en","ca-ru","cs-be","cs-en","cs-ru","cs-uk","da-en","da-ru","de-be","de-en","de-es","de-fr","de-it","de-ru","de-tr","de-uk","el-en","el-ru","en-be","en-ca","en-cs","en-da","en-de","en-el","en-es","en-et","en-fi","en-fr","en-hu","en-it","en-lt","en-lv","en-mk","en-nl","en-no","en-pt","en-ru","en-sk","en-sl","en-sq","en-sv","en-tr","en-uk","es-be","es-de","es-en","es-ru","es-uk","et-en","et-ru","fi-en","fi-ru","fr-be","fr-de","fr-en","fr-ru","fr-uk","hr-ru","hu-en","hu-ru","hy-ru","it-be","it-de","it-en","it-ru","it-uk","lt-en","lt-ru","lv-en","lv-ru","mk-en","mk-ru","nl-en","nl-ru","no-en","no-ru","pl-be","pl-ru","pl-uk","pt-en","pt-ru","ro-be","ro-ru","ro-uk","ru-az","ru-be","ru-bg","ru-ca","ru-cs","ru-da","ru-de","ru-el","ru-en","ru-es","ru-et","ru-fi","ru-fr","ru-hr","ru-hu","ru-hy","ru-it","ru-lt","ru-lv","ru-mk","ru-nl","ru-no","ru-pl","ru-pt","ru-ro","ru-sk","ru-sl","ru-sq","ru-sr","ru-sv","ru-tr","ru-uk","sk-en","sk-ru","sl-en","sl-ru","sq-en","sq-ru","sr-be","sr-ru","sr-uk","sv-en","sv-ru","tr-be","tr-de","tr-en","tr-ru","tr-uk","uk-bg","uk-cs","uk-de","uk-en","uk-es","uk-fr","uk-it","uk-pl","uk-ro","uk-ru","uk-sr","uk-tr"]}
 */
var yandexTranslator = function () {

    var service = {

        /**
         * Translates given text to the target language. source language should be set, but can also be null.
         * If null yandex will try to detect language automatically.
         *
         * @param text text for translation
         * @param sourceLanguage source language or null
         * @param targetLanguage target language
         * @param callback callback to be called
         */
        translate: function (text, sourceLanguage, targetLanguage, callback) {
            var to = sourceLanguage + '-' + targetLanguage;
            if (!sourceLanguage) {
                to = targetLanguage;
            }

            translate.translate(text, {to: to}, function (err, res) {
                if (err) {
                    return callback(err);
                }
                if(!res.text){
                    console.error('yandex :: Translation service returned invalid data');
                    return;
                }
                console.log('Translation received: ', JSON.stringify(res.text));
                if (res.text.length && res.text.length > 0) {
                    callback(null, res.text[0]);
                } else {
                    callback(null, res.text);
                }

            });
        },

        /**
         * Detects language of given text
         * @param text text to be detected
         * @param callback
         */
        detect: function (text, callback) {
            translate.detect(text, function (err, res) {
                if (err) {
                    return callback(err);
                }
                callback(null, res.lang)
            });
        }
    };

    return service;
};

module.exports = yandexTranslator();