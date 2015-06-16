var http = require("http");
var io = require('socket.io');

var sessionsConnections = {};
var whereIsUserVisitingFrom = {};

console.log("\n\n-------------------------------- Server Started --------------------------------");

var server = http.createServer(function(req, res){ 
    var body = '';
    req.on('data', function(data){
        console.log('Received Data');
        body += data;
    });
    req.on('end', function() {
        // Emit the data to all clients
        ioServer.emit('message', { message: body });
    });
});
server.listen(8000);

var ioServer = io.listen(server, { log: false });

ioServer.on('connection', function(socket) {

    var currentUser;

    var parts;

    socket.on('started', function(data) {
        currentUser = data.username;
        sessionsConnections[currentUser] = socket.id;
        whereIsUserVisitingFrom[currentUser] = data.from;
        socket.emit("connected", { message: "Welcome, " + currentUser + "!" });

        socket.broadcast.emit("updateUsers", { message: sessionsConnections, from: whereIsUserVisitingFrom });
        socket.emit("updateUsers", { message: sessionsConnections, from: whereIsUserVisitingFrom });
    });

    socket.on('message', function(data) {
        var parts = data.message.split("|");

        socket.broadcast.emit("updateUsers", { message: sessionsConnections, from: whereIsUserVisitingFrom });
        socket.emit("updateUsers", { message: sessionsConnections, from: whereIsUserVisitingFrom });

        console.log("Message Recieved!");

        if( parts[0] == "*" ) {
            socket.broadcast.emit("display", { message: data.message });
        }else{
            if( parts[0] in sessionsConnections ) {
                io.sockets.socket(sessionsConnections[parts[0]]).emit("display", { message: data.message });
            }else{
                socket.emit("display", { message: "That user is not online!" });
            }
        }
    });

    socket.on('disconnect', function() {
        delete sessionsConnections[currentUser];
        socket.broadcast.emit("updateUsers", { message: sessionsConnections, from: whereIsUserVisitingFrom });
        socket.emit("updateUsers", { message: sessionsConnections, from: whereIsUserVisitingFrom });
    });

});