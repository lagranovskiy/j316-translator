var socketIO = require('socket.io');
var serviceDistributor = require('../business/ServiceDistributor');
var questionDistributor = require('../business/QuestionDistributor');

var consumerConnector = function (httpServer) {

    var io = socketIO(httpServer);

    serviceDistributor.on('translationReady', function (translationObject) {
        console.info('Emitting translation ' + translationObject.timestamp + 'to socket roam for ' + translationObject.targetLanguage);

        io.sockets.to('lang_' + translationObject.targetLanguage).emit('newTranslation', translationObject);
    });

    /**
     * Socket server for handlich translation service
     */
    io.on('connection', function (socket) {

        var userReg = null;

        console.info('translations :: New Client is online. ' + socket.id);


        // If the client closed up his registration, then add him to the active msg. recievers for his lang
        socket.on('singin', function (data) {
            console.info('translations :: Sing in the client: ' + JSON.stringify(data));

            if (!data.language) {
                console.error('translations :: Client ' + data.sender + ' has no lang preference defined. Default: en');
                data.language = 'en';
            }

            if (socket.client.userReg != null) {
                console.info('translations :: Client ' + data.sender + ' change his language settings from ' + socket.client.userReg.language + ' to ' + data.language);
                serviceDistributor.removeTranslationLanguage(socket.client.userReg.language);
                socket.leave('lang_' + data.language);
                console.info('translations :: Client ' + data.sender + ' excluded from room ' + 'lang_' + socket.client.userReg.language);
            }

            socket.client.userReg = data;
            socket.join('lang_' + data.language);
            serviceDistributor.addTranslationLanguage(socket.client.userReg.language);

            // Recipe connection
            console.info('translations :: Client ' + data.sender + ' added to room  lang_' + data.language);
            socket.emit('singinCompleted', {success: true});

            // Send cached messages if any
            var cachedMsgs = serviceDistributor.getCachedMessages(socket.client.userReg.language);
            if (cachedMsgs && cachedMsgs.length > 0) {
                socket.emit('cachedTranslations', cachedMsgs);
            }
        });

        // If the client closed up his registration, then add him to the active msg. recievers for his lang
        socket.on('singout', function () {
            if (socket.client.userReg && socket.client.userReg.language) {
                serviceDistributor.removeTranslationLanguage(socket.client.userReg.language);
                socket.leave('lang_' + socket.client.userReg.language);
                console.info('translations :: Client ' + socket.client.userReg.sender + '(' + socket.id + ')' + ' leaved roam lang_' + socket.client.userReg.language);
            }
        });

        // when the user disconnects.. perform this
        socket.on('disconnect', function () {
            if (socket.client.userReg && socket.client.userReg.language) {
                serviceDistributor.removeTranslationLanguage(socket.client.userReg.language);
                socket.leave('lang_' + socket.client.userReg.language);
            }
            console.info('translations :: Client (' + socket.id + ') disconnected');

        });
    });

    /**
     * Socket server for handling of client questions
     */



    var msgSocketServer = io.of('/questions');


    /**
     * Emits answered question to the source
     * @param translationObject
     */
    function emitQuestionAnswer(translationObject) {
        console.info('Emitting question answer to the client ' + translationObject.questionSource);

        msgSocketServer.sockets.to(translationObject.questionSource).emit('newQuestionAnswer', translationObject);
    }

    questionDistributor.on('newQuestionAnswerTranslated', emitQuestionAnswer);

    msgSocketServer.on('connection', function (socket) {
        console.info('questions :: New Client is online. ' + socket.id);

        // when the client emits 'add user', this listens and executes
        socket.on('question', function (msg) {
            console.info('questions :: New Message!!' + JSON.stringify(msg));
            questionDistributor.submitQuestion(socket.id, msg.sender, msg.msg, msg.language);
            console.info('questions :: Message pending...' + JSON.stringify(msg));
        });


        // when the user disconnects.. perform this
        socket.on('disconnect', function () {
            console.info('questions :: Client ' + socket.id + ' disconnected');
            questionDistributor.removeListener('newQuestionAnswerTranslated', emitQuestionAnswer);
        });
    });


    return io;
};


module.exports = consumerConnector;

