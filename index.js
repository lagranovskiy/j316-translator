// Setup basic express server
require('newrelic');
var express = require('express');
var config = require('./config/config');
var morgan = require('morgan');
var socketIO = require('socket.io');
var cookieSession = require("express-session");
var RedisStore = require('connect-redis')(cookieSession);
var socketIOredis = require('socket.io-redis');
var sharedsession = require("express-socket.io-session");
var redis = require("redis");

var j316app = express();

j316app.set('trust proxy', 1); // trust first proxy


//////////////////// Session init //////////////////////


var redisStore = new RedisStore({
    client: redis.createClient(config.redis, {return_buffers: true, socket_keepalive: true}),
    ttl: 4 * 60 * 60
});

var sessionExpiry = 1000 * 60 * 60 * 4;// 4 hours

var expressSession = cookieSession({
    store: redisStore,
    secret: config.sessionSecret,
    key: 'j316.sessionID',
    resave: true,
    saveUninitialized: true,
    maxAge: sessionExpiry, // req.session.cookie.maxAge will return the time remaining in milliseconds, which we may also re-assign a new value to adjust the .expires property appropriately
    cookie: {
        path: '/',
        httpOnly: true,
        secure: false,
        expires: new Date(Date.now() + sessionExpiry),
        maxAge: sessionExpiry
    }
});

j316app.use(expressSession);

/**
 * Important! This session modification provides the client with a persistene cookie id.
 */
j316app.get("/*", function (req, res, next) {
    if (!req.session.identified) {
        req.session.identified = true;
    }
    next();
});


var httpServer = require('http').createServer(j316app);
var ioServer = socketIO(httpServer);

var sharedSessionMiddleware = sharedsession(expressSession,
    {
        autoSave: true
    });

ioServer.use(sharedSessionMiddleware);
ioServer.set('transports', ['websocket', 'polling', 'xhr-polling']);
ioServer.set('origins', '*:*');

/**
 * Clustering shares eminitted messages between multiple nodes
 */
if (config.clusterMode == 'true') {
    console.info('index :: Entering a cluster mode');
    ioServer.adapter(socketIOredis({
        pubClient: redis.createClient(config.redis, {return_buffers: true, socket_keepalive: true}),
        subClient: redis.createClient(config.redis, {return_buffers: true, socket_keepalive: true}),
        ttl: 1 * 60 * 60
    }));
} else {
    console.info('index :: Entering a non clustered mode');
}

var consumerConnectorSetup = require('./app/connector/ConsumerConnector');
consumerIO = ioServer.of('/consumer');
consumerIO.use(sharedSessionMiddleware);
consumerConnectorSetup(consumerIO);

var senderConnectorSetup = require('./app/connector/SenderConnector');
var senderIO = ioServer.of('/sender');
senderIO.use(sharedSessionMiddleware);
senderConnectorSetup(senderIO);


////////////////// HTTP Init ////////////////////
j316app.use('/bower_components', express.static(__dirname + '/public/bower_components/'));
j316app.use('/control/bower_components', express.static(__dirname + '/public/bower_components/'));
j316app.use('/', express.static(__dirname + '/public/consumer/'));
j316app.use('/control', express.static(__dirname + '/public/sender/'));

j316app.use(morgan(':method :url :response-time'));


httpServer.listen(config.port, function () {
    console.log('J316 Server listening at port %d', config.port);
});
