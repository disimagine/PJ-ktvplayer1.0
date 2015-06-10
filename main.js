var express = require('express');
app = express();
port = process.env.PORT || 4000;

//var http = require('http').createServer(app);//???
//var io = require('socket.io')(http);
var counter = 0;
var userids= [];//新增一個array儲存所有進來的人

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
connection.connect();
//----------------------------------------------mysql prepared

/*
*	Ajax
*	1./getname : get userids
*	2./register : get username and password and create a new account
*	3./login : get username and password and check if it existed in the database 'songlist'
*	4./addsong :get the song ID(11-digit) and add it to the database 
* 	5./deletesong : get the song ID(11-digit) and delete such song in the database 'songlist'
*/

//1.
app.get('/getname', function(req, res){
		 counter++;
		 var text = 'Hi~' + JSON.stringify(userids) + '.'; /*req.query.id*/
		 
		 userids.push(req.query.haha+"WWW success ,req.params also works");
		 var text2 = 'num' +counter;
	  //res.send(JSON.stringify({"id":"123"}));
	  
	  res.send("+++++"+JSON.stringify(userids));

});

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
 		console.log('2. now [dataSONG_ID] is :'+data.SONG_ID);//5/20
 		console.log('ready to insert....');
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




app.use(express.static(__dirname + '/public/ktvplayer'));//------    /public
//app.use(express.static('../ktvplayer'));


app.listen(port);//???
//http.listen(port); //have to replace "app.listen(port);""

/*
var http = require('http');
var express = require('express');
var app = express();
var server = http.createServer(app);
app.get('/',function(request, response){ //我們要處理URL為 "/" 的HTTP GET請求
    response.end('你好！'); //作出回應
});
server.listen(8080,'127.0.0.1',function(){
    console.log('HTTP伺服器在 http://127.0.0.1:8080/ 上運行');
});
*/


/* socket.io */
/*
io.on('connection', function(socket){
		socket.broadcast.emit('hi! broadcasting~');
 		console.log('a user connected');
 		//
 		socket.on('disconnect', function(){
    		console.log('user disconnected');
    	});
    	//
    	socket.on('instr_toserver',function(data_fromclient){
    		console.log('instruction:'+data_fromclient.action);
    		socket.emit('instr_toclient',data_fromclient);
    	});
  		
});
*/