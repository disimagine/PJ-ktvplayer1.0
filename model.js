//var DB = require('./db').DB;
var DB = require('./db');



var User = DB.Model.extend({
   tableName: 'tblusers',//tblUsers竟然也可以==
   idAttribute: 'userId',
});

module.exports = {
   User: User,
   Songlist: Songlist// 6/4
};