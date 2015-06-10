//var DB = require('./db').DB;
var DB = require('./db');



var Songlist = DB.Model.extend({
   tableName: 'songlist',
   idAttribute: 'SONG_ID',
});

var User = DB.Model.extend({
   tableName: 'tblusers',//tbl"U"sers竟然也可以==
   idAttribute: 'userId',
});


module.exports = {
   User: User,
   Songlist: Songlist// 6/4
};