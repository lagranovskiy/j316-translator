var socketIO = require('socket.io');
var serviceDistributor = require('../business/ServiceDistributor');
var questionDistributor = require('../business/QuestionDistributor');

var senderConnector = function (httpServer) {

    var io = socketIO(httpServer);


    io.on('connection', function (socket) {
        var senderInfo = null;


    });

    /**
     * Socket server for handling of client questions
     */
    var questionSocketServer = io.of('/questions');

    questionDistributor.on('newQuestionTranslated', function (questionMsg) {
        console.info('Sender connector recieved translated question request (' + questionMsg.questionUUID + ')');
        if (!questionMsg) {
            return;
        }
        questionSocketServer.sockets.to(questionMsg.targetId).emit('newQuestion', questionMsg);
    });

    questionSocketServer.on('connection', function (socket) {
        console.info('questions :: New Writer is online. ' + socket.id);


        /**
         * Every writer need to trigger question translation to his own language
         */
        questionDistributor.on('newQuestionPending', function (questionUUID) {
            console.info('Sender connector recieved question request (' + questionUUID + ')');
            if (!senderInfo) {
                return;
            }
            questionDistributor.requestQuestionTranslation(questionUUID, socket.id, senderInfo.language);
        });

        // when the user disconnects.. perform this
        socket.on('disconnect', function () {
            console.info('questions :: Writer ' + socket.id + ' disconnected');
        });
    });

    return io;
};

module.exports = senderConnector;


