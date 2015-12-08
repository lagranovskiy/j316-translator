var socketIO = require('socket.io');

var consumerConnector = function (httpServer) {

    var io = socketIO(httpServer);

    io.on('connection', function (socket) {
        var addedUser = false;
        console.info('New Connection!!');
        // when the client emits 'new message', this listens and executes
        socket.on('new message', function (data) {
            console.info('New Message!!' + data);
            // we tell the client to execute 'new message'
            socket.broadcast.emit('new message', {
                username: socket.username,
                message: data
            });
        });

        // when the client emits 'add user', this listens and executes
        socket.on('question', function (msg) {
            console.info('New Message!!' + msg);
        });

        // when the client emits 'typing', we broadcast it to others
        socket.on('typing', function () {
            socket.broadcast.emit('typing', {
                username: socket.username
            });
        });

        // when the client emits 'stop typing', we broadcast it to others
        socket.on('stop typing', function () {
            socket.broadcast.emit('stop typing', {
                username: socket.username
            });
        });

        // when the user disconnects.. perform this
        socket.on('disconnect', function () {
            console.info('Bye!!');
            if (addedUser) {
                --numUsers;

                // echo globally that this client has left
                socket.broadcast.emit('user left', {
                    username: socket.username,
                    numUsers: numUsers
                });
            }
        });
    });


    return io;
};


module.exports = consumerConnector;

