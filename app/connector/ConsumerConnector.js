var config = require('../../config/config');
var serviceDistributor = require('../business/ServiceDistributor');
var questionDistributor = require('../business/QuestionDistributor');

var consumerConnector = function (socketChannel) {


    /**
     * Socket server for handlich translation service
     */
    socketChannel.on('connection', function (socket) {

        console.info('client :: New Client is online. ' + socket.id);


        socket.on('error', function(err) {
            if (err === 'handshake error') {
                console.log('handshake error', err);
            }
            else {
                console.log('io error', err);
            }
        });
        
        socket.conn.on('heartbeat', function () {
            if (socket.handshake.session && socket.handshake.session.clientAuthenticated) {
                // Allow idling for new clients
                if (!socket.handshake.session.clientAuthenticatedOn ||
                    new Date().getTime() - socket.handshake.session.clientAuthenticatedOn > 1000 * 60 * config.maxWaitingTime) {
                    // If a client forgot to logout then force logout after configured inactivity timeout of translator
                    if (new Date().getTime() - serviceDistributor.getLastActivity() > 1000 * 60 * config.inactiveTimeout) {
                        console.info('client :: no active translation session. Forcing disconnect of the client ' + socket.id);
                        handleLogout();
                        socket.handshake.session.save();
                        socket.emit('authenticate');
                    }
                    else {
                        console.info('client :: Client online without sender');
                    }
                }
            }
        });

        // Inform client about application branch
        socket.emit('info', {
            brand: config.info.appBrand,
            brandContact: config.info.brandContact
        });

        if (socket.handshake.session && socket.handshake.session.clientAuthenticated) {
            console.info('client :: Returning authenticated client ' + socket.id);
            initSubscribtions();
            socket.emit('alreadyAuthenticated', {
                clientName: socket.handshake.session.clientName,
                clientLanguage: socket.handshake.session.clientLanguage
            });
            emitCache();
        } else {
            console.info('client :: Send auth request to sender ' + socket.id);
            socket.emit('authenticate');
        }

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
            if (socket.handshake.session && socket.handshake.session.clientLanguage != undefined) {
                serviceDistributor.removeTranslationLanguage(socket.handshake.session.clientLanguage);
                console.info('client :: Client ' + socket.handshake.session.clientName + '(' + socket.id + ')' + ' leaved roam lang_' + socket.handshake.session.clientLanguage);
            }

        }

        /**
         * Process user disconnect
         */
        function handleLogout() {
            if (socket.handshake.session && socket.handshake.session.clientLanguage != undefined) {
                serviceDistributor.removeTranslationLanguage(socket.handshake.session.clientLanguage);
                socket.leave('lang_' + socket.handshake.session.clientLanguage);
                socket.handshake.session.clientAuthenticated = false;
                delete  socket.handshake.session.clientName;
                delete  socket.handshake.session.clientLanguage;
                delete  socket.handshake.session.clientAuthenticatedOn;
            }
            console.info('client :: Client (' + socket.id + ') disconnected');
        }


        /**
         * Process user registration in system and subscribtion to a language channel
         * @param authRq
         */
        function handleSingIn(authRq) {

            console.info('client :: Sing in the client: ' + JSON.stringify(authRq));

            if (!authRq.clientLanguage) {
                console.error('client :: Client ' + authRq.clientName + ' has no lang preference defined. Default: en');
                authRq.clientLanguage = 'en';
            }

            var sessionData = socket.handshake.session;
            if (sessionData.clientLanguage) {
                console.info('client :: Signing in of already signed user. clearing subscribtions');
                serviceDistributor.removeTranslationLanguage(sessionData.clientLanguage);
                socket.leave('lang_' + sessionData.clientLanguage);
            }
            sessionData.clientAuthenticated = true;
            sessionData.clientAuthenticatedOn = new Date().getTime();
            sessionData.clientName = authRq.clientName;
            sessionData.clientLanguage = authRq.clientLanguage;

            initSubscribtions();

            // Recipe connection
            socket.emit('singinCompleted', {success: true});

            emitCache();

        }

        /**
         * Process subscription update if any
         */
        function initSubscribtions() {
            var data = socket.handshake.session;

            socket.join('lang_' + data.clientLanguage);
            serviceDistributor.addTranslationLanguage(data.clientLanguage);
            console.info('client :: Client ' + data.clientName + ' added to room  lang_' + data.clientLanguage);
        }

        /**
         * Send cached messages if any
         */
        function emitCache() {
            // Send cached messages if any
            var cachedMsgs = serviceDistributor.getCachedMessages(socket.handshake.session.clientLanguage);
            console.info('client :: Lookup for saved messages for lang: ' + socket.handshake.session.clientLanguage);
            if (cachedMsgs && cachedMsgs.length > 0) {
                console.info('client :: Retrieving cached messages for language ' + socket.handshake.session.clientLanguage);
                socket.emit('cachedTranslations', cachedMsgs);
            }
        }


        /**
         * Add Question to queue and ack the message
         * @param msg
         */
        function handleNewQuestion(msg) {
            console.info('client :: New Question!!' + JSON.stringify(msg));
            if (!msg.msg || msg.msg.length == 0) {
                console.info('client :: Ignoring empty question');
                return;
            }
            var question = questionDistributor.submitQuestion(socket.id, msg.sender, msg.msg, msg.language);
            socketChannel.to(socket.id).emit('questionAck', question);
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
        console.info('client :: Emitting translation ' + translationObject.timestamp + ' to socket roam for ' + translationObject.targetLanguage);
        socketChannel.to('lang_' + translationObject.targetLanguage).emit('newTranslation', translationObject);
    }

    /**
     * Emits answered question to the source
     * @param translationObject
     */
    questionDistributor.on('newQuestionAnswerTranslated', emitAnswerTranslated);


    /**
     *  * {
    *     questionUUID: 'qww23un2r3r3',
     *    questionSourceId: 'iX28un2dcc',
     *    questionSourceName: 'Leo',
     *    questionText: 'Hello how are you',
     *    answerSource: 'Danke gut',
     *    answerText: 'Fine thanks',
     *    answerTranslation: 'Danke gut',
     *    answerSenderName: 'Max'
     * }
     * @param translatedQuestion  question answer object
     */
    function emitAnswerTranslated(translatedQuestion) {
        console.info('client :: Emitting question answer to the client ' + translatedQuestion.questionSourceId);
        socketChannel.to(translatedQuestion.questionSourceId).emit('newQuestionAnswer', translatedQuestion);
    }

    return socketChannel;

};


module.exports = consumerConnector;

