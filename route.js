// vendor library
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');

// custom library
// model
var Model = require('./model');

// index
var index = function(req, res, next) {
   if(!req.isAuthenticated()) {
      res.redirect('/signin');
   } else {

      var user = req.user;

      if(user !== undefined) {
         user = user.toJSON();
         //console.log('in route.js 19, [user] is :',user);
      }
      res.render('youtubeplayerCOPY', {title: 'Home', user: user});
   }
};

// sign in
// GET
var signIn = function(req, res, next) {
   if(req.isAuthenticated()) res.redirect('/');//登入成功之後又傳送/signin的URL的話會被redirect到google
   res.render('signin', {title: 'Sign In28'});
};

// sign in
// POST

var signInPost = function(req, res, next) {
   passport.authenticate('local', { successRedirect: '/',//----   /
                                    //這裡可以跨網域轉址@@ redirect到google沒問題
                          failureRedirect: '/signin35'})(req, res, next);
};

/*
var signInPost = function(req, res, next) {
   passport.authenticate('local', { successRedirect: 'http://tw.yahoo.com/',//----   /
                          failureRedirect: '/signin35'}, function(err, user, info) {
      if(err) {//不明error
         return res.render('signin', {title: 'Sign In37', errorMessage: err.message});
      } 

      if(!user) {//帳號密碼錯誤
         return res.render('signin', {title: 'Sign In41', errorMessage: info.message});
      }
      return req.logIn(user, function(err) {
         if(err) {//不明error
            return res.render('signin', {title: 'Sign In45', errorMessage: err.message});
         } else {//登入成功
            return res.redirect('/');
         }
      });
   })(req, res, next);
};*/

// sign up
// GET
var signUp = function(req, res, next) {
   if(req.isAuthenticated()) {
      res.redirect('/');
   } else {
      res.render('signup', {title: 'Sign Up'});
   }
};

// sign up
// POST
var signUpPost = function(req, res, next) {
   var user = req.body;
   var usernamePromise = null;
   usernamePromise = new Model.User({username: user.username}).fetch();

   return usernamePromise.then(function(model) {
      if(model) {
         res.render('signup', {title: 'signup', errorMessage: 'username already exists'});
      } else {
         //****************************************************//
         // MORE VALIDATION GOES HERE(E.G. PASSWORD VALIDATION)
         //****************************************************//
         var password = user.password;
         var hash = bcrypt.hashSync(password);

         var signUpUser = new Model.User({username: user.username, password: hash});

         signUpUser.save().then(function(model) {
            // sign in the newly registered user
            signInPost(req, res, next);
         });	
      }
   });
};

// sign out
var signOut = function(req, res, next) {
   if(!req.isAuthenticated()) {
      notFound404(req, res, next);
   } else {
      req.logout();
      res.redirect('/signin');
   }
};

// 404 not found
var notFound404 = function(req, res, next) {
   res.status(404);
   res.render('404', {title: '404 Not Found'});
};




var getName = function(req, res){
      console.log("hI this is /getname function");
      //res.redirect('http://codetw.com/node-js-express1/');

      res.redirect('/');//這裡不行跨網域轉址  WHY? (compared to line 35)
      /*
       counter++;
       var text = 'Hi~' + JSON.stringify(userids) + '.'; /*req.query.id*/
       /*
       userids.push(req.query.haha+"WWW success ,req.params also works");
       var text2 = 'num' +counter;
     //res.send(JSON.stringify({"id":"123"}));
     
     res.send("+++++"+JSON.stringify(userids));
*/
};




// export functions
/**************************************/
// index
module.exports.index = index;

// sigin in
// GET
module.exports.signIn = signIn;
// POST
module.exports.signInPost = signInPost;

// sign up
// GET
module.exports.signUp = signUp;
// POST
module.exports.signUpPost = signUpPost;

// sign out
module.exports.signOut = signOut;

// 404 not found
module.exports.notFound404 = notFound404;

//getName
module.exports.getName = getName;