var socketIO = require('socket.io');
var serviceDistributor = require('../business/ServiceDistributor');

var senderConnector = function (httpServer) {

    var io = socketIO(httpServer);


    serviceDistributor.on('deleted', function (data) {
        console.info('>> Sender: Booking created notification (' + data + ')');

    });

    io.on('connection', function (socket) {


    });


    return io;
};

module.exports = senderConnector;


