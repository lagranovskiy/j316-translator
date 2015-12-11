// Setup basic express server
var express = require('express');
var config = require('./config/config');
var morgan = require('morgan');
var socketIO = require('socket.io');


//////////////////// Socket INIT //////////////////////

var j316app = express();
j316app.use(morgan(':method :url :response-time'));
var httpServer = require('http').createServer(j316app);

var ioServer = socketIO(httpServer);

var consumerConnectorSetup = require('./app/connector/ConsumerConnector');
consumerConnectorSetup(ioServer.of('/consumer'));

var senderConnectorSetup = require('./app/connector/SenderConnector');
senderConnectorSetup(ioServer.of('/sender'));


////////////////// HTTP Init ////////////////////
j316app.use('/', express.static(__dirname + '/public/consumer/'));
j316app.use('/control', express.static(__dirname + '/public/sender/'));



httpServer.listen(config.port, function () {
    console.log('J316 Server listening at port %d', config.port);
});






