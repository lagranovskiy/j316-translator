// Setup basic express server
var express = require('express');
var config = require('./config/config');


//////////////////// Consumer INIT //////////////////////

var consumerApp = express();
var consumerServer = require('http').createServer(consumerApp);

var consumerConnectorSetup = require('./app/connector/ConsumerConnector');
consumerConnectorSetup(consumerServer);

consumerServer.listen(config.consumer.port, function () {
    console.log('Consumer Server listening at port %d', config.consumer.port);
});

// Routing
consumerApp.use(express.static(__dirname + '/public/consumer/'));


//////////////////// End of Consumer INIT //////////////////////

//////////////////// Sender (Admin) INIT //////////////////////

var senderApp = express();
var senderServer = require('http').createServer(senderApp);

var senderConnectorSetup = require('./app/connector/SenderConnector');
senderConnectorSetup(senderServer);

senderServer.listen(config.sender.port, function () {
    console.log('Sender Server listening at port %d', config.sender.port);
});

// Routing
senderApp.use(express.static(__dirname + '/public/sender/'));

//////////////////// End Sender (Admin) INIT //////////////////////









