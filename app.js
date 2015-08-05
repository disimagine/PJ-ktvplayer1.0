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
  createSocket(req);
    //沒有或res.send ,使此函數沒有"成功結束",
  //client端不會執行Callback function
  res.send("finished 258");
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

//global var to keep all nsps


var nsps = [];
var createSocket = function(req){
    var my_namespace  = req.query.nsp;
    var hash_namespace = my_namespace;//QQQQQQ之後前端加密後送過來
    var user = req.query.user;

    if (my_namespace!=''||my_namespace!=null){
      var newNsp = "/"+my_namespace;
      for(var key in nsps){
        console.log("scanning.....:"+nsps[key]);
        if (newNsp == nsps[key] ) {
          //房間內人數++
          console.log("336-----------room user_count ++");
          updateRoom(hash_namespace,true);
          return "this newNsp already exists.";
        }
      }
      //newNsp is whole new to nsps[]
      //add this new nsp and insert into `room` table
      console.log("-----------329 to add new nsp");
      nsps.push(newNsp);//add to nsps[]
      console.log("----------nsps:"+nsps);
      namespaceSocket(hash_namespace);//使用加密的開起nsp
      addroom(my_namespace,hash_namespace,user);
      
      

    }


};
var namespaceSocket = function(hash_namespace){
    var nsp = io.of('/'+hash_namespace);
    nsp.on('connection', function(nsp_socket){
      //console.log('content of para [nsp_socket] is:',nsp_socket);
      nsp.emit('nsp', hash_namespace);
      console.log('someone connected into '+hash_namespace);
      nsp_socket.on('disconnect',function(){
        console.log('user in ',hash_namespace,' disconnected');
        updateRoom(hash_namespace,false);//房間人數--
      });
      nsp_socket.on('instr_toserver',function(data_fromclient){
        console.log('---------nsp in function is listening----------:');
        console.log('instruction:',data_fromclient.action);
        nsp.emit('instr_toclient',data_fromclient);
      });
      
    });
    
};


var addroom = function(my_namespace,hash_namespace,user){
      var roomname = my_namespace;
      var nsp = hash_namespace; 

      var result = '-1';
      
      
      if (roomname==""){//empty input
         console.log('Fail to add new room! roomname cannot be null.');
         console.log(error);
         res.send(result);// send :-1
         return;
      }
      
      var data = {
          'room_name' : roomname,
          'room_nsp' : nsp,
          'create_by' :　user
      }
      console.log('---------------ready to insert---------------');
      console.log('2. now [data] is :'+JSON.stringify(data));//5/20
      
      connection.query('INSERT INTO `ktvroom` SET ?', data, function(error){

         
             if(error){//username has been used.
               result ='0';
               //res.send(result);//send: 0 
                 console.log('寫入資料失敗！');
                 console.log(error);
                 //throw error;
                 return;
             }
         
          //insert successfully
          result = '1';//success
          console.log('SUCCESS! New room is added. ');
          //res.send(result);//send: 1 //5/20
          return;
          //res.send(result);

      });
};

var updateRoom = function(hash_namespace,connect){
  var old_user_count ;
  connection.query('SELECT `user_count` FROM `ktvroom` where `room_nsp` = ?', hash_namespace, function(error,rows,fields){
      if(error){
        console.log("updateRoom-SELECTing FAIL");
        console.log(error);
        return;
      }
      if(rows.length!=1){
        console.log("nsp is duplicated. Please check it");
        return;
      }
      for (var key in rows){
        old_user_count = rows[key].user_count;
        console.log("original user-count ..."+old_user_count);
      }

      //判定要加人或減人
      var new_user_count ;
      if(connect==true){//有人進來，人數++
        //new_user_count = old_user_count++; wrong!
        new_user_count = ++old_user_count;
      }else{//有人離開 ,人數--
        new_user_count = --old_user_count;
      }
      //start to updating
      console.log("after updating,  new_user_count should be..."+new_user_count);
      connection.query('UPDATE `ktvroom` SET `user_count` = ? where `room_nsp` = ?',[new_user_count,hash_namespace],function(error){
          if (error){
            console.log("updateRoom-UPDATEing FAIL");
            console.log(error);
            return;
          }
          console.log('SUCCESS! New user_count is updated. ');
          return;
      });
  })
};

var deleteRoom =  function(){

}

var deletAllRoom = function(){
  
}

/********************************/

/* server closed*/
//close server by CTRL+C


process.on('SIGINT', function() {
  console.log('start to close the server...');
  io.close();
  console.log('------>disconnect db connections.');
  connection.end();
  process.exit(0);//不加這行的話cmd不會結束
  
  return "Server is closed successfully.";
});

console.log("app.js enddddd");