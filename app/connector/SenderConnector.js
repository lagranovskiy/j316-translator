var socketIO = require('socket.io');
var config = require('../../config/config');
var serviceDistributor = require('../business/ServiceDistributor');
var questionDistributor = require('../business/QuestionDistributor');
var socketAuth = require('socketio-auth');

var senderConnector = function (socketChannel) {


    socketChannel.on('connection', function (socket) {

        console.info('sender :: New Sender is online. ' + socket.id);

        socket.on('newMessage', handleNewMessage);

        // when the user disconnects.. perform this
        socket.on('disconnect', handleDisconnect);

        /**
         * Every writer need to trigger question translation to his own language
         */
        questionDistributor.on('newQuestionPending', listenPendingQuestion);


        /**
         * Process user disconnect
         */
        function handleDisconnect() {

            if (socket.client.sender && socket.client.sender.language) {
                serviceDistributor.removeTranslationLanguage(socket.client.sender.language);
                socket.leave('lang_' + socket.client.sender.language);
            }
            console.info('sender :: Sender (' + socket.id + ') disconnected');
            questionDistributor.removeListener('newQuestionPending', listenPendingQuestion);
            socket.disconnect();
        }


        /**
         * Handles new text to be translated and distributed
         * @param newMessage
         */
        function handleNewMessage(newMessage) {

            if (!socket.auth) {
                return console.error('Unauthenticated user tries to send translation text.');
            }
            if (!newMessage) {
                return;
            }
            console.info('sender ::  Sender ' + socket.client.sender.name + ' send a new message for translation and distribution');
            if (!newMessage.language) {
                newMessage.language = socket.client.sender.language;
            }
            serviceDistributor.requestTranslation(newMessage.text, newMessage.language, socket.client.sender.name);
        }

        /**
         * Every Socket should listen for the question and then request a translation to its own language
         * @param questionUUID uuid of new question
         */
        function listenPendingQuestion(questionUUID) {
            if (!socket.auth) {
                return;
            }
            console.info('Sender connector received question request (' + questionUUID + ')');
            questionDistributor.requestQuestionTranslation(questionUUID, socket.id, socket.client.sender.language);
        }


    });


    /**
     * Service part
     *
     */

    socketAuth(socketChannel, {
            authenticate: authenticate,
            postAuthenticate: singIn,
            timeout: 'none'
        }
    );

    /**
     * Process socket user authentication
     * @param socket
     * @param data
     * @param callback
     * @returns {*}
     */
    function authenticate(socket, data, callback) {
        //get credentials sent by the client
        var accessKey = data.accessKey;

        if (!accessKey) return callback(new Error("Access key not found"));
        return callback(null, accessKey === config.sender.accessKey);
    }


    /**
     * Connects a sender to the engine
     * @param socket
     * @param data
     */
    function singIn(socket, data) {
        console.info('sender :: Sing in the sender: ' + JSON.stringify(data));

        if (!data.sender.language) {
            console.error('sender :: Sender ' + data.sender.name + ' has no lang preference defined. Default: de');
            data.sender.language = 'de';
        }

        if (socket.client.sender != null) {
            console.info('sender :: Sender ' + data.sender.name + ' change his language settings from ' + data.sender.language + ' to ' + data.sender.language);
            socket.leave('lang_' + data.sender.language);
            serviceDistributor.removeTranslationLanguage(data.sender.language);
        }

        socket.client.sender = data.sender;
        socket.join('lang_' + data.sender.language);
        serviceDistributor.addTranslationLanguage(data.sender.language);

        // Recipe connection
        console.info('sender :: Sender ' + data.sender.name + ' added to room  lang_' + data.sender.language);
        socket.emit('singinCompleted', {success: true});

        // Send cached messages if any
        var cachedMsgs = serviceDistributor.getCachedMessages(socket.client.sender.language);
        if (cachedMsgs && cachedMsgs.length > 0) {
            socket.emit('cachedTranslations', cachedMsgs);
        }
    }


    /**
     * Singleton handlers
     */

    serviceDistributor.on('translationReady', emitTranslationToSender);


    /**
     * Called if any question was translated and can now be emitted to concrete sender
     */
    questionDistributor.on('newQuestionTranslated', emitTranslatedQuestion);


    serviceDistributor.on('listenersChanged', emitListenersChanged);


    /**
     * Sends listeners information to the senders
     * @param languageList
     */
    function emitListenersChanged(languageList) {
        console.info('Sending lang list to senders');

        socketChannel.emit('listenersChanged', languageList);
    }


    /**
     * Sends translation of submited text to all senders
     * @param translationObject
     */
    function emitTranslationToSender(translationObject) {
        console.info('Emitting translation ' + translationObject.timestamp + 'to socket roam for ' + translationObject.targetLanguage);

        socketChannel.to('lang_' + translationObject.targetLanguage).emit('newTranslation', translationObject);
    }


    /**
     * Sends translated question to concrete socket requested it
     * @param questionMsg
     */
    function emitTranslatedQuestion(questionMsg) {
        console.info('Sender connector received translated question request (' + questionMsg.questionUUID + ')');
        if (!questionMsg) {
            return;
        }
        socketChannel.to(questionMsg.targetId).emit('newQuestion', questionMsg);
    }


    return socketChannel;
};

module.exports = senderConnector;


