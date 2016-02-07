var config = require('../../config/config');
var serviceDistributor = require('../business/ServiceDistributor');
var questionDistributor = require('../business/QuestionDistributor');

var senderConnector = function (socketChannel) {


    socketChannel.on('connection', function (socket) {

        console.info('sender :: New Sender is online. ' + socket.id);

        socket.emit('info', {
            brand: config.info.appBrand,
            brandContact: config.info.brandContact
        });


        socket.conn.on('heartbeat', function () {
            if (socket.handshake.session && socket.handshake.session.senderAuthenticated) {
                // Allow idling for new clients
                if (!socket.handshake.session.senderAuthenticatedOn ||
                    new Date().getTime() - socket.handshake.session.senderAuthenticatedOn > 1000 * 60 * config.maxWaitingTime) {
                    // If a sender forgot to logout then force logout after configured inactivity timeout of translator
                    if (new Date().getTime() - serviceDistributor.getLastActivity() > 1000 * 60 * config.inactiveTimeout) {
                        console.info('sender :: no active translation session. Forcing disconnect of the sender ' + socket.id);
                        handleLogout();
                        socket.handshake.session.save();
                        socket.emit('authenticate');
                    }
                }
            }
        });


        if (socket.handshake.session && socket.handshake.session.senderAuthenticated) {
            console.info('sender :: Returning authenticated sender ' + socket.id);
            initSubscribtions();
            socket.emit('alreadyAuthenticated', {
                senderName: socket.handshake.session.senderName,
                senderLanguage: socket.handshake.session.senderLanguage
            });
            emitCache();
        } else {
            console.info('sender :: Send auth request to sender ' + socket.id);
            socket.emit('authenticate');
        }

        // Authentication
        socket.on('authentication', authentication);


        /**
         * Process socket user authentication
         * @param authRq auth request
         * @returns {*}
         */
        function authentication(authRq) {
            //get credentials sent by the client
            if (!authRq) {
                return socket.error('sender ::  wrong auth request');
            }

            var accessKey = authRq.accessKey;

            if (config.accessKey === accessKey) {
                socket.handshake.session.senderAuthenticated = true;
                socket.handshake.session.senderAuthenticatedOn = new Date().getTime();
                console.info('sender :: authentication success for ' + authRq.senderName);
                socket.emit('authenticated');
                singIn(authRq);
            } else {
                socket.handshake.session.senderAuthenticated = false;
                socket.emit('unauthorized', 'Access key wrong');
                console.info('sender :: authentication failure for ' + authRq.senderName);
            }
        }


        /**
         * Connects a sender to the engine
         * @param authRq
         */
        function singIn(authRq) {
            console.info('sender :: Sing in the sender: ' + JSON.stringify(authRq));

            if (!authRq.senderLanguage) {
                console.error('sender :: Sender ' + authRq.senderName + ' has no lang preference defined. Default: de');
                authRq.senderLanguage = 'de';
            }

            var sessionData = socket.handshake.session;
            if (sessionData.senderLanguage) {
                console.info('sender :: Signing in of already signed sender. clearing subscribtions');
                serviceDistributor.removeTranslationLanguage(sessionData.senderLanguage);
                socket.leave('lang_' + sessionData.senderLanguage);
            }

            sessionData.senderName = authRq.senderName;
            sessionData.senderLanguage = authRq.senderLanguage;

            initSubscribtions();

            // Recipe connection
            console.info('sender :: Sender ' + authRq.senderName + ' added to room  lang_' + authRq.senderLanguage);
            socket.emit('singinCompleted', {success: true});

            // Send cached messages if any
            var cachedMsgs = serviceDistributor.getCachedMessages(sessionData.senderLanguage);
            if (cachedMsgs && cachedMsgs.length > 0) {
                socket.emit('cachedTranslations', cachedMsgs);
            }

            emitCache();
        }


        /**
         * Process subscription update if any
         */
        function initSubscribtions() {
            var sessionData = socket.handshake.session;

            socket.join('lang_' + sessionData.senderLanguage);
            serviceDistributor.addTranslationLanguage(sessionData.senderLanguage);
            console.info('client :: Client ' + sessionData.senderName + ' added to room  lang_' + sessionData.senderLanguage);

            // Help session handling. If sender authenticated, it will be expected that in max configured waiting time any message arrives to preven client disconnection
            serviceDistributor.renewLastActivity();
        }

        /**
         * Send cached messages if any
         */
        function emitCache() {
            // Send cached messages if any
            var cachedMsgs = serviceDistributor.getCachedMessages(socket.handshake.session.clientLanguage);
            if (cachedMsgs && cachedMsgs.length > 0) {
                socket.emit('cachedTranslations', cachedMsgs);
            }
        }

        // handling of messages

        socket.on('newMessage', handleNewMessage);

        socket.on('answeredQuestion', handleAnsweredQuestion);

        socket.on('requestListenersInfo', handleRequestListenersInfo);


        // when the user disconnects.. perform this
        socket.on('disconnect', handleDisconnect);

        // If the client closed up his registration, then add him to the active msg. recievers for his lang
        socket.on('singout', handleLogout);

        /**
         * Every writer need to trigger question translation to his own language
         */
        questionDistributor.on('newQuestionPending', listenPendingQuestion);


        /**
         * Process user disconnect
         */
        function handleDisconnect() {
            if (socket.handshake.session && socket.handshake.session.senderLanguage) {
                serviceDistributor.removeTranslationLanguage(socket.handshake.session.senderLanguage);
            }
            console.info('sender :: Sender (' + socket.id + ') disconnected');
        }

        /**
         * Process user disconnect
         */
        function handleLogout() {
            if (socket.handshake.session) {
                serviceDistributor.removeTranslationLanguage(socket.handshake.session.senderLanguage);
                socket.leave('lang_' + socket.handshake.session.senderLanguage);
                socket.handshake.session.senderAuthenticated = false;
                delete  socket.handshake.session.senderName;
                delete  socket.handshake.session.senderLanguage;
                delete  socket.handshake.session.senderAuthenticatedOn;
            }

            console.info('sender :: Sender (' + socket.id + ') disconnected');
        }

        /**
         * Handles new text to be translated and distributed
         * @param newMessage
         */
        function handleNewMessage(newMessage) {
            if (!socket.handshake.session) {
                socket.error('Authentication broken. Please login again.');
                return console.error('sender :: Unauthenticated user tries to send translation text.');
            }
            if (!newMessage) {
                return;
            }
            if (!newMessage.text || newMessage.text.length == 0) {
                console.info('sender :: Ignoring empty message');
                return;
            }
            console.info('sender ::  Sender ' + socket.handshake.session.senderName + ' send a new message for translation and distribution');
            if (!newMessage.language) {
                newMessage.language = socket.handshake.session.senderLanguage;
            }
            serviceDistributor.requestTranslation(newMessage.text, newMessage.language, socket.handshake.session.senderName);
        }


        /**
         * Answers listeners request on demand
         */
        function handleRequestListenersInfo() {
            socket.emit('listenersChanged', serviceDistributor.languageList);
        }

        /**
         * Every Socket should listen for the question and then request a translation to its own language
         * @param questionUUID uuid of new question
         */
        function listenPendingQuestion(questionUUID) {
            if (!socket.handshake.session.senderAuthenticated) {
                socket.error('Authentication broken. Please login again.');
                return;
            }
            console.info('sender :: Sender connector received question request (' + questionUUID + ')');
            questionDistributor.requestQuestionTranslation(questionUUID, socket.id, socket.handshake.session.senderLanguage);
        }

        /**
         * Handles new answer for a question to be translated and distributed
         *
         *  {
             *  "questionUUID":"9e5a0359-f1a7-485b-aa9e-b6715d1e8273",
             *  "answer":"answer text"
             *  }
         *
         * @param answeredQuestion
         */
        function handleAnsweredQuestion(answeredQuestion) {
            if (!socket.handshake.session.senderAuthenticated) {
                socket.error('Authentication broken. Please login again.');
                return console.error('sender :: Unauthenticated user tries to send translation text.');
            }
            if (!answeredQuestion || !answeredQuestion.answer || answeredQuestion.answer.length == 0) {
                console.info('sender :: Ignoring empty question answer');
                return;
            }
            console.info('sender ::  Sender ' + socket.handshake.session.senderName + ' send answered a question and it will be distributed');
            questionDistributor.submitQuestionAnswer(
                answeredQuestion.answer,
                answeredQuestion.questionUUID,
                socket.handshake.session.senderName,
                answeredQuestion.language);

            answeredQuestion.answerSenderName = socket.handshake.session.senderName;
            socketChannel.emit('answerAck', answeredQuestion);

        }


    });


    /**
     * Singleton handlers
     */

    serviceDistributor.on('translationReady', emitTranslationToSender);

    serviceDistributor.on('listenersChanged', emitListenersChanged);

    /**
     * Called if any question was translated and can now be emitted to concrete sender
     */
    questionDistributor.on('newQuestionTranslated', emitTranslatedQuestion);


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
        console.info('sender :: Emitting translation ' + translationObject.timestamp + ' to socket roam for ' + translationObject.targetLanguage);

        socketChannel.to('lang_' + translationObject.targetLanguage).emit('newTranslation', translationObject);
    }


    /**
     * Sends translated question to concrete socket requested it
     * @param questionMsg
     */
    function emitTranslatedQuestion(questionMsg) {
        console.info('sender :: Sender connector received translated question request (' + questionMsg.questionUUID + ')');
        if (!questionMsg) {
            return;
        }
        socketChannel.to(questionMsg.targetId).emit('newQuestion', questionMsg);
    }


    return socketChannel;
};

module.exports = senderConnector;


