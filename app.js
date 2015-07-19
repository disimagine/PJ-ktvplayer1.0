// vendor libraries
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bcrypt = require('bcrypt-nodejs');
var ejs = require('ejs');
var path = require('path');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

// custom libraries
// routes
var route = require('./route');
// model
var Model = require('./model');

var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

passport.use(new LocalStrategy(function(username, password, done) {
   new Model.User({username: username}).fetch().then(function(data) {
      var user = data;
      if(user === null) {
         return done(null, false, {message: 'Invalid username or password'});
      } else {
         user = data.toJSON();
         if(!bcrypt.compareSync(password, user.password)) {
            return done(null, false, {message: 'Invalid username or password'});
         } else {
            return done(null, user);
         }
      }
   });
}));

passport.serializeUser(function(user, done) {
  done(null, user.username);
});

passport.deserializeUser(function(username, done) {
   new Model.User({username: username}).fetch().then(function(user) {
      done(null, user);
   });
});

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cookieParser());
app.use(bodyParser());
app.use(session({secret: 'secret strategic xxzzz code'}));
app.use(passport.initialize());
app.use(passport.session());

// GET
app.get('/', route.index);

// signin
// GET
app.get('/signin', route.signIn);
// POST
app.post('/signin', route.signInPost);

// signup
// GET
app.get('/signup', route.signUp);
// POST
app.post('/signup', route.signUpPost);

// logout
// GET
app.get('/signout', route.signOut);

/*
*  Ajax
*  1./getname : get userids
*  2./register : get username and password and create a new account
*  3./login : get username and password and check if it existed in the database 'songlist'
*  4./addsong :get the song ID(11-digit) and add it to the database 
*  5./deletesong : get the song ID(11-digit) and delete such song in the database 'songlist'
*/

//1.
app.get('/getname', route.getName);

//2.
 app.get('/register', function(req, res){
      
       // MSQL INSERT.....
       /*test

       var data = {
          name: 'columns',
          
      };*/

      var result = '-1';//blank
      var username = req.query.username;//OK
      var password = req.query.password;
      
      if(username==''||password==''){//OK
         console.log('ERROR! Username or password cannot be null');
         res.send(result);
         return ;
      }
      //username & password not blank

      

      var data = {
          USERNAME: username,
          PASSWORD: password
      }
      connection.query('INSERT INTO `ktvuser` SET ?', data, function(error){

         
             if(error){//username has been used.
               result ='0';
               res.send(result);
                 console.log('寫入資料失敗！');
                 //throw error;
                 return;
             }
         
          //insert successfully
          result = '1';//success
          console.log('SUCCESS! Account created. ');
          res.send(result);
      });

       
       
        //res.send(JSON.stringify({"status":"true"}));
     //res.send(JSON.stringify(userids));

 });

//3.
 app.get('/login', function(req, res){
      // MSQL SELECT .....
      var result = '-1';
      var username = req.query.username;//OK
      var password = req.query.password;
      
      if(username==''||password==''){
         console.log('ERROR! Username or password cannot be null');
         res.send(result);
         return ;
      }
      //username & password not blank

      connection.query('SELECT `USERNAME`,`PASSWORD` from `ktvuser`',function(error, rows, fields){
          //檢查是否有錯誤
          /*
          if(error){}
          */
          //console info會出現在command window
          result = '0';
          for(var i in rows){//for loop
             console.log(rows[i].USERNAME); //test
             console.log(rows[i].PASSWORD); //123
             if(username==rows[i].USERNAME&&password==rows[i].PASSWORD){
               result='1';//success
               console.log('SUCCESS! Account exists.');
             }                    
         }
         
         res.send(result);
      });
      
        //res.send(JSON.stringify({"status":"true"}));
     //res.send(JSON.stringify(userids));
 });



//4.
 app.get('/addsong', function(req, res){
      var songID = req.query.songID;
      var result = '-1';
      
      
      if (songID==""){//empty input
         console.log('Fail to add new song! Song ID cannot be null.');
         res.send(result);// send :-1
         return;
      }
      console.log('now [data] is :'+data);//5/20
      var data = {
          SONG_ID: songID
      }
      console.log('---------------ready to insert---------------');
      console.log('2. now [dataSONG_ID] is :'+data.SONG_ID);//5/20
      
      connection.query('INSERT INTO `songlist` SET ?', data, function(error){

         
             if(error){//username has been used.
               result ='0';
               res.send(result);//send: 0 
                 console.log('寫入資料失敗！');
                 //throw error;
                 return;
             }
         
          //insert successfully
          result = '1';//success
          console.log('SUCCESS! New song is added. ');
          console.log('??req.query.songID = '+req.query.songID);//5/20
          res.send(result);//send: 1 //5/20
          return;
          //res.send(result);

      });
});

//5.
app.get('/deletesong', function(req, res){
      var songID = req.query.songID;
      var result = '-1';
      if (songID==""){//empty input
         console.log('Fail to delete the song! Song ID cannot be null.');
         res.send(result);
         return;
         
      }
      var data ={
         SONG_ID : songID
      };
      console.log('-----------start to delete song-----------');
      console.log('2. now [dataSONG_ID] is :'+data.SONG_ID);//5/20
      connection.query('DELETE from `songlist` where `SONG_ID` = ?', data.SONG_ID, function(err, fields) {  
            if (err){
               console.log('刪除資料失敗！');
               return;
            }

                //throw err;  
        });   
        res.send("1");//5/20 加了之後delete就不會pending吧
      //QQQQQQQ直接刪或先查再刪  ??未完!!!!

      //QQQQQQQ歌單應儲存時間資訊,送出delete時把songID 和 create_time連帶送出 才可區別
      //否則若歌單中有兩首song A 會都被刪掉  

});


app.get('/nsp_socket',function(req,res){
  console.log("server 253");
  //namespaceSocket(req.query.nsp);
  //return;
  //res.send("haha");
});


/********************************/

/********************************/
// 404 not found
app.use(route.notFound404);//在此函數之後的app.get會失效，所以必須把app.get寫在前面  WHY/

var server = http.listen(app.get('port'), function(err) {
   if(err) throw err;

   var message = 'Server is running @ http://localhost:' + server.address().port;
   console.log(message);
});





/////////////////////////////////////////////////////main.js

//---------------------------------------------mysql
//載入MySQL模組
var mysql = require('mysql');
//建立連線
var connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'admin',
    database: 'cklab'
});
//開始連接
//connection.connect();此動作改到socket io 聽到connect event時才作
//----------------------------------------------mysql prepared


/********************************/
/********************************/
/* socket.io */
//broadcast to EVERYONE
io.on('connection', function(socket){
    //console.log('content of para [socket] is:',socket);
    socket.broadcast.emit('hi! welcome to KAREOKE ONLINE~');
    console.log('a user connected');
    //
    socket.on('disconnect', function(){
        console.log('user disconnected');
      });
      //
    socket.on('instr_toserver',function(data_fromclient){
        console.log('instruction:',data_fromclient.action);
        socket.emit('instr_toclient',data_fromclient);
    });
      
});

//broadcast to custom namespaces

// TODO
var my_namespace = 'ESOE';
    var nsp = io.of('/'+my_namespace);
    nsp.on('connection', function(socket){
      nsp.emit('hi', 'enveryone!','here is', my_namespace);
      console.log('someone connected into '+my_namespace);
      nsp.on('disconnect',function(){
        console.log('user in ',my_namespace,' disconnected');
      });
      nsp.on('instr_toserver',function(data_fromclient){
        console.log('instruction:',data_fromclient.action);
        socket.to(my_namespace).emit('instr_toclient',data_fromclient);
      });

    });

var namespaceSocket = function(my_namespace){
    var nsp = io.of('/'+my_namespace);
    nsp.on('connection', function(socket){
      nsp.emit('hi', 'enveryone!','here is', my_namespace);
      console.log('someone connected into '+my_namespace);
      nsp.on('disconnect',function(){
        console.log('user in ',my_namespace,' disconnected');
      });
      nsp.on('instr_toserver',function(data_fromclient){
        console.log('instruction:',data_fromclient.action);
        socket.to(my_namespace).emit('instr_toclient',data_fromclient);
      });

    });
    
};

/********************************/

/* server closed*/
//close server by CTRL+C


process.on('SIGINT', function() {
  console.log('start to close the server...');
  server.close();
});

server.on('close',function(){
  console.log(' Server is closed successfully.');
  console.log('------>disconnect db connections.');
  connection.end();
  process.exit(0);
});


console.log("app.js enddddd");