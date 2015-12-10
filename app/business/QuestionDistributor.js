var async = require('neo-async');
var _ = require('underscore');
var EventEmitter = require("events").EventEmitter;
var NodeCache = require("node-cache");
var uuid = require('node-uuid');
var util = require('util');
var translationWorker = require('../provider/TranslationWorker');


/**
 * Service distributor provides the connection between business logic and clients communication
 */
var serviceDistributor = _.extend(new EventEmitter(), {

    msgCache: new NodeCache({stdTTL: 60 * 30, checkperiod: 120}),


    /**
     * Submits a new question
     * Because there can be more than one sender who can answer the question, we dont know language which sender speaks.
     * In this step they should be informed and may request the translation by id
     *
     * @param questionSource
     * @param questionText
     * @param originalLang
     */
    submitQuestion: function (questionSource, questionSourceName, questionText, originalLang) {
        var questionUUID = uuid.v4();
        var timestamp = new Date().getTime();
        this.msgCache.set(questionUUID, {
            questionUUID: questionUUID,
            questionSource: questionSource,
            questionSourceName: questionSourceName,
            text: questionText,
            sourceLanguage: originalLang,
            timestamp: timestamp
        });

        serviceDistributor.emit('newQuestionPending', questionUUID);
    },

    /**
     * Request question translation. emits newQuestionTranslated event if ready. translated item is stored in event body.
     * @param questionUUID
     * @param senderId
     * @param senderLanguage
     */
    requestQuestionTranslation: function (questionUUID, senderId, senderLanguage) {
        var question = this.msgCache.get(questionUUID);
        if (!question) {
            console.error('Cannot find msg with uuid ' + questionUUID + ' request not accepted.');
            return;
        }

        translationWorker.translationQueue.push({
            text: question.text,
            sourceLanguage: question.sourceLanguage,
            targetLanguage: senderLanguage
        }, function (err, translation) {
            if (err) {
                return console.error('Problem by the translation of question ' + questionUUID + ' in ' + senderLanguage + ':' + err);
            }

            console.info('Question Translation completed: ' + senderLanguage);

            question.translation = translation;
            question.targetId = senderId;
            question.targetLanguage = senderLanguage;

            serviceDistributor.emit('newQuestionTranslated', question);

            console.info('Question Translation emitted to language ' + senderLanguage);
        });
    },

    /**
     * Provides the back translation from sender to client
     * @param answer text to be translated
     * @param questionUUID question uuid
     * @param senderId sender socket
     * @param senderLanguage sender Language
     */
    submitQuestionAnswer: function (answer, questionUUID, senderId, senderLanguage) {
        var question = this.msgCache.get(questionUUID);
        if (!question) {
            console.error('Cannot find msg with uuid ' + questionUUID + ' answer not accepted.');
            return;
        }

        translationWorker.translationQueue.push({
            text: answer,
            sourceLanguage: senderLanguage,
            targetLanguage: question.sourceLanguage
        }, function (err, translation) {
            if (err) {
                return console.error('Problem by the translation of question answer ' + questionUUID + ' in ' + senderLanguage + ':' + err);
            }

            console.info('Question Answer Translation completed: ' + senderLanguage);

            var translationRs = {
                questionSource: question.questionSource,
                translation: translation,
                sourceLanguage: senderLanguage,
                targetLanguage: question.sourceLanguage
            };

            serviceDistributor.emit('newQuestionAnswerTranslated', translationRs);

            console.info('Question Answer Translation emitted to language ' + question.sourceLanguage);
        });
    }


});
module.exports = serviceDistributor;