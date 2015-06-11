
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
console.log("loading fs...");
var fs = require('fs-extra');
console.log("loading multer...");
var multer = require('multer');
console.log("loading passport...");
var session = require('express-session');
var mongoose = require('mongoose');
var passport = require ('./DataAcces/auth');
var spawn = require('child_process').spawn;
var dbConfig = require('./DataAcces/database');
var user = require('./DataAcces/usercollection');


var app = express();

// view engine setup
app.use(logger('dev'));
mongoose.connect(dbConfig.url);

app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// uncomment after placing your favicon in /public


//app.use(express.session({ secret: 'keyboard cat' }));
//passport
app.use(session({ secret: 'secret',resave:true,saveUninitialized:true })); // session secret
//var auth = require('./DataAcces/Auth');

//var user = mongoose.model('users');

//app.use(passport.initialize());
//app.use(passport.session());
var flash = require('connect-flash');
app.use(flash());
app.use(multer({
  dest: './public/uploadimg/',
  rename: function (fieldname, filename) {
    return filename.replace(/\W+/g, '-').toLowerCase() + Date.now()
  }
}
));

app.use(express.static(path.join(__dirname, 'javascripts')));
app.use(express.static(path.join(__dirname, 'uploadimg')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var users = require('./routes/users');
//var routes = require('./routes/index')(app,passport);
var routes = require('./routes/index');

app.use('/', routes);
app.use('/users', users);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

var cp = spawn(process.env.comspec, ['/c', 'command', '-arg1', '-arg2']);

cp.stdout.on("data", function(data) {
  console.log(data.toString());
});

cp.stderr.on("data", function(data) {
  console.error(data.toString());
});
// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});



module.exports = app
