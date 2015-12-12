var socketIO = require('socket.io');
var serviceDistributor = require('../business/ServiceDistributor');
var questionDistributor = require('../business/QuestionDistributor');

var consumerConnector = function (socketChannel) {


    /**
     * Socket server for handlich translation service
     */
    socketChannel.on('connection', function (socket) {

        console.info('translations :: New Client is online. ' + socket.id);

        // If the client closed up his registration, then add him to the active msg. recievers for his lang
        socket.on('singin', handleSingIn);

        // If the client closed up his registration, then add him to the active msg. recievers for his lang
        socket.on('singout', handleLogout);

        // when the user disconnects.. perform this
        socket.on('disconnect', disconnectClient);

        // when the client emits 'add user', this listens and executes
        socket.on('question', handleNewQuestion);


        /**
         * Process client disconnect
         */
        function disconnectClient() {
            if (socket.handshake.session.client && socket.handshake.session.client.language) {
                serviceDistributor.removeTranslationLanguage(socket.handshake.session.client.language);
                socket.leave('lang_' + socket.handshake.session.client.language);
                console.info('client :: Client ' + socket.handshake.session.client.sender + '(' + socket.id + ')' + ' leaved roam lang_' + socket.handshake.session.client.language);
            }

        }

        /**
         * Process user disconnect
         */
        function handleLogout() {
            if (socket.handshake.session.client) {
                serviceDistributor.removeTranslationLanguage(socket.handshake.session.client.language);
                socket.leave('lang_' + socket.handshake.session.client.language);
                delete socket.handshake.session.client;
            }
            console.info('client :: Client (' + socket.id + ') disconnected');
        }


        /**
         * Process user registration in system and subscribtion to a language channel
         * @param data
         */
        function handleSingIn(data) {

            console.info('client :: Sing in the client: ' + JSON.stringify(data));

            if (!data.language) {
                console.error('client :: Client ' + data.sender + ' has no lang preference defined. Default: en');
                data.language = 'en';
            }

            if (socket.handshake.session.client != null) {
                console.info('client :: Client ' + data.sender + ' change his language settings from ' + socket.handshake.session.client.language + ' to ' + data.language);
                serviceDistributor.removeTranslationLanguage(socket.handshake.session.client.language);
                socket.leave('lang_' + data.language);
                console.info('client :: Client ' + data.sender + ' excluded from room ' + 'lang_' + socket.handshake.session.client.language);
            }

            socket.handshake.session.client = data;
            socket.join('lang_' + data.language);
            serviceDistributor.addTranslationLanguage(socket.handshake.session.client.language);

            // Recipe connection
            console.info('client :: Client ' + data.sender + ' added to room  lang_' + data.language);
            socket.emit('singinCompleted', {success: true});

            // Send cached messages if any
            var cachedMsgs = serviceDistributor.getCachedMessages(socket.handshake.session.client.language);
            if (cachedMsgs && cachedMsgs.length > 0) {
                socket.emit('cachedTranslations', cachedMsgs);
            }

        }


        function handleNewQuestion(msg) {
            console.info('client :: New Question!!' + JSON.stringify(msg));
            questionDistributor.submitQuestion(socket.id, msg.sender, msg.msg, msg.language);
            console.info('client :: Message pending...' + JSON.stringify(msg));
        }


    });


    /**
     * Singleton business action listeners
     */

    /**
     * Listener that a translation is ready for a single language. Will be called for every registered language
     */
    serviceDistributor.on('translationReady', emitTranslation);

    function emitTranslation(translationObject) {
        console.info('client :: Emitting translation ' + translationObject.timestamp + 'to socket roam for ' + translationObject.targetLanguage);
        socketChannel.to('lang_' + translationObject.targetLanguage).emit('newTranslation', translationObject);
        //io.sockets.to('lang_' + translationObject.targetLanguage).emit('newTranslation', translationObject);
    }

    /**
     * Emits answered question to the source
     * @param translationObject
     */
    questionDistributor.on('newQuestionAnswerTranslated', emitQuestionTranslated);

    function emitQuestionTranslated(translationObject) {
        console.info('client :: Emitting question answer to the client ' + translationObject.questionSource);

        socketChannel.to(translationObject.questionSource).emit('newQuestionAnswer', translationObject);
    }

    return socketChannel;

};


module.exports = consumerConnector;

