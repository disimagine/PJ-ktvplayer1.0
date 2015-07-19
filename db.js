/*
var Bookshelf = require('bookshelf');

var config = {
   host: '127.0.0.1',  // your host
   user: 'root', // your database user
   password: 'admin', // your database password
   database: 'dbUsers',
   charset: 'UTF8_GENERAL_CI',

};

var DB = Bookshelf.initialize({
   client: 'mysql', 
   connection: config
});

module.exports.DB = DB;
*/


var knex = require('knex')({
  client: 'mysql',
  connection: {
    host     : '127.0.0.1',
    user     : 'root',
    password : 'admin',
    database : 'cklab',
    charset  : 'utf8'
  }
});

var bookshelf = require('bookshelf')(knex);
// export bookshelf to the world
module.exports = bookshelf; 
