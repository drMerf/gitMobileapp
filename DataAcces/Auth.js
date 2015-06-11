
var passport = require('passport'),
LocalStrategy = require('passport-local').Strategy;
//var user = mongoose.model('users');
var user = require('./usercollection');

passport.use(new LocalStrategy( {
  // by default, local strategy uses username and password, we will override with email
  usernameField : 'username',
  passwordField : 'password',
  passReqToCallback : true // allows us to pass back the entire request to the callback
},
  function(req, username, password, done) {
    User.findOne({ 'local.username' :  username }, function(err, user) {
      // if there are any errors, return the error before anything else
      if (err)
        return done(err);

        // if no user is found, return the message
        if (!user)
          return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

          // if the user is found but the password is wrong
          if (!user.validPassword(password))
            return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

            // all is well, return successful user
            return done(null, user);
          });
        }
      ));

  passport.serializeUser(function(user, done) {
    // please read the Passport documentation on how to implement this. We're now
    // just serializing the entire 'user' object. It would be more sane to serialize
    // just the unique user-id, so you can retrieve the user object from the database
    // in .deserializeUser().
    done(null, user.id);
  });
  passport.deserializeUser(function(user, done) {
    user.findById(id, function (err, user) {
      done(err, user);
    });
  });
  // passport/login.js







          module.exports = passport
