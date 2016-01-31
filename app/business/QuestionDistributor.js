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

    msgCache: new NodeCache({stdTTL: 60 * 180, checkperiod: 120}),


    /**
     * Submits a new question
     * Because there can be more than one sender who can answer the question, we dont know language which sender speaks.
     * In this step they should be informed and may request the translation by id
     *
     *
     * Cached Question:
     *   {
    *     questionUUID: 'qww23un2r3r3',
     *    questionSourceId: 'iX28un2dcc',
     *    questionSourceName: 'Leo',
     *    questionText: 'Hello how are you',
     *    questionLanguage: 'en',
     *    questionTimestamp: '1234235255'              // Timestamp of question
     *   }
     *
     * @param questionSource
     * @param questionSourceName
     * @param questionText
     * @param originalLang
     */
    submitQuestion: function (questionSource, questionSourceName, questionText, originalLang) {

        var questionUUID = uuid.v4();
        var timestamp = new Date().getTime();
        var question = {
            questionUUID: questionUUID,
            questionSourceId: questionSource,
            questionSourceName: questionSourceName,
            questionText: questionText,
            questionLanguage: originalLang,
            questionTimestamp: timestamp
        };
        this.msgCache.set(questionUUID, question);

        console.info('Question :: New question cached. Emitting to the senders.');

        serviceDistributor.emit('newQuestionPending', questionUUID);

        return question;
    },

    /**
     * Request question translation. emits newQuestionTranslated event if ready. translated item is stored in event body.
     *
     *   Translated Question:
     *   {
     *    questionUUID: 'qww23un2r3r3',
     *    questionSourceId: 'iX28un2dcc',
     *    questionSourceName: 'Leo',
     *    questionText: 'Hello how are you',
     *    questionLanguage: 'en',
     *    questionTimestamp: '1234235255',              // Timestamp of question
     *    questionTranslation: "Hallo wie gehts",       // Translated text for sender
     *    targetId: "N3424nNOUINDD",                    // Sender who are going to answer
     *    targetLanguage: "de"                          // Langauge of sender where the question is translated
     *   }
     *
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
            text: question.questionText,
            sourceLanguage: question.questionLanguage,
            targetLanguage: senderLanguage
        }, function (err, translation) {
            if (err) {
                return console.error('Problem by the translation of question ' + questionUUID + ' in ' + senderLanguage + ':' + err);
            }

            console.info('Question Translation completed: ' + senderLanguage);

            question.questionTranslation = translation;
            question.targetId = senderId;
            question.targetLanguage = senderLanguage;

            // Known issue: According to the architecture we need to ignore the possibility that there can be multiple language senders.
            // Only the last question translation will be cached because of simplicity.
            serviceDistributor.msgCache.set(questionUUID, question);
            serviceDistributor.emit('newQuestionTranslated', question);

            console.info('Question Translation emitted to language ' + senderLanguage);
        });
    },

    /**
     * Provides the back translation from sender to client
     *
     * {
    *     questionUUID: 'qww23un2r3r3',
     *    questionSourceId: 'iX28un2dcc',
     *    questionSourceName: 'Leo',
     *    questionText: 'Hello how are you',
     *    answerSource: 'Danke gut',
     *    answerText: 'Fine thanks',
     *    answerTranslation: 'Danke gut',
     *    answerSenderName: 'Max'
     * }
     *
     * @param answer text to be translated
     * @param questionUUID question uuid
     * @param senderName sender name
     * @param senderLanguage sender Language
     */
    submitQuestionAnswer: function (answer, questionUUID, senderName, senderLanguage) {
        var question = this.msgCache.get(questionUUID);
        if (!question) {
            console.error('Cannot find msg with uuid ' + questionUUID + ' answer not accepted.');
            return;
        }

        question.answered = true;
        question.answeredBy = senderName;

        this.msgCache.set(questionUUID, question);

        translationWorker.translationQueue.push({
            text: answer,
            sourceLanguage: senderLanguage,
            targetLanguage: question.questionLanguage
        }, function (err, translation) {
            if (err) {
                return console.error('Problem by the translation of question answer ' + questionUUID + ' in ' + senderLanguage + ':' + err);
            }

            console.info('Question Answer Translation completed: ' + senderName + ':' + senderLanguage);

            var translationRs = {
                questionUUID: questionUUID,
                questionSourceId: question.questionSourceId,
                questionSourceName: question.questionSourceName,
                questionText: question.questionText,
                answerText: answer,
                answerTranslation: translation,
                answerSenderName: senderName
            };

            serviceDistributor.msgCache.set(questionUUID, question);
            serviceDistributor.emit('newQuestionAnswerTranslated', translationRs);

            console.info('Question Answer Translation emitted to language ' + question.sourceLanguage);
        }, this);
    },

    /**
     * Returns the cached questions.
     * @param languageKey
     * @returns {Array} of msgs
     */
    getCachedQuestions: function () {
        var retVal = [];
        _.each(this.msgCache.keys(), function (key) {
            retVal.unshift(this.msgCache.get(key));
        }, this);

        return retVal;
    }


});
module.exports = serviceDistributor;