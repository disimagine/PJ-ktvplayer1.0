var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  //res.send('<h1>Hello world</h1>');
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  socket.broadcast.emit('hi');
  console.log('a user connected');
  socket.on('chat_message_toserver', function(msg){
    console.log('message: ' + msg);
    io.emit('chat_message_toclient', msg);
  });
  socket.on('keyboardstatus_toserver', function(msg){
    io.emit('keyboardstatus_toclient', msg);
  });

  
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});