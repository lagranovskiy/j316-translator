// Setup basic express server
var express = require('express');
var config = require('./config/config');
var morgan = require('morgan');
var socketIO = require('socket.io');
var cookieSession = require("express-session");
var sharedsession = require("express-socket.io-session");


//////////////////// Socket INIT //////////////////////

var j316app = express();
j316app.set('trust proxy', 1); // trust first proxy

var session = cookieSession({
    secret: "my-secret",
    resave: true,
    saveUninitialized: true,
    maxAge: 24 * 60 * 60 * 1000
});

j316app.use(session);


j316app.use(morgan(':method :url :response-time'));

var httpServer = require('http').createServer(j316app);

var ioServer = socketIO(httpServer);

ioServer.use(
    sharedsession(session,
        {
            autoSave: true
        }
    )
);

var consumerConnectorSetup = require('./app/connector/ConsumerConnector');
consumerIO = ioServer.of('/consumer');
consumerIO.use(sharedsession(session, {autoSave: true}));
consumerConnectorSetup(consumerIO);

var senderConnectorSetup = require('./app/connector/SenderConnector');
var senderIO = ioServer.of('/sender');
senderIO.use(sharedsession(session, {autoSave: true}));
senderConnectorSetup(senderIO);


////////////////// HTTP Init ////////////////////
j316app.use('/bower_components', express.static(__dirname + '/public/bower_components/'));
j316app.use('/control/bower_components', express.static(__dirname + '/public/bower_components/'));
j316app.use('/', express.static(__dirname + '/public/consumer/'));
j316app.use('/control', express.static(__dirname + '/public/sender/'));


httpServer.listen(config.port, function () {
    console.log('J316 Server listening at port %d', config.port);
});






