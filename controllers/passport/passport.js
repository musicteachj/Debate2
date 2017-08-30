var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var FacebookStrategy = require("passport-facebook").Strategy;
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var constants = require('../../constants');
var FACEBOOK_AUTH = constants.facebookAuth;
var GOOGLE_AUTH = constants.googleAuth;
var db = require("../../models");

// Telling passport we want to use a Local Strategy. In other words, we want login with a username/email and password
passport.use(new LocalStrategy(
  // Our user will sign in using an email, rather than a "username"
  {
    usernameField: "email"
  },
  function(email, password, done) {
    // When a user tries to sign in this code runs
    db.Users.findOne({
      where: {
        email: email
      }
    }).then(function(dbUser) {
      // If there's no user with the given email
      if (!dbUser) {
        return done(null, false, {
          message: "Incorrect email."
        });
      }
      // If there is a user with the given email, but the password the user gives us is incorrect
      else if (!dbUser.validPassword(password)) {
        return done(null, false, {
          message: "Incorrect password."
        });
      }
      // If none of the above, return the user
      return done(null, dbUser);
    });
  }
));

// In order to help keep authentication state across HTTP requests,
// Sequelize needs to serialize and deserialize the user
// Just consider this part boilerplate needed to make it all work
passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  console.log(id)
  db.Users.findOne({
    where: {
      id: id
    }
  }).then(function(dbUser) {
    // console.log("The fetched user is", dbUser);
    // If there's no user with the given email
    // if (!dbUser) {
    //   return done(null, false, {
    //     message: "Incorrect email."
    //   });
    // }
    // If there is a user with the given email, but the password the user gives us is incorrect
    // else if (!dbUser.validPassword(password)) {
    //   return done(null, false, {
    //     message: "Incorrect password."
    //   });
    // }
    // If none of the above, return the user
    cb(null, dbUser);
  });

});

// Facebook Login
passport.use(new FacebookStrategy({
      clientID: FACEBOOK_AUTH.clientID,
      clientSecret: FACEBOOK_AUTH.clientSecret,
      callbackURL: FACEBOOK_AUTH.callbackURL
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log('accessToken ',accessToken);
    console.log('profile ',profile);
    console.log('profile.id  ',profile.id);
      var selector = { where: { facebookId: profile.id},defaults:{ username:profile.id }};
      db.Users.findOrCreate(selector)
        .then(function(user) {
            //console.log('user ',user[0].dataValues);
            if(user[0] && user[0].dataValues){
                return cb(null, user[0].dataValues);
            }
            return cb({message:'Please try again'})
        }).catch(function (err) {
          return cb(err,null);
      });

  }
));

passport.use(new GoogleStrategy({
      clientID: GOOGLE_AUTH.clientID,
      clientSecret: GOOGLE_AUTH.clientSecret,
      callbackURL: GOOGLE_AUTH.callbackURL
  },
  function(accessToken, refreshToken, profile, cb) {
      console.log('accessToken ',accessToken);
      console.log('profile ',profile);
      console.log('profile.id  ',profile.id);
      var selector = { where: { googleId: profile.id},defaults:{ username:profile.id }};
      db.Users.findOrCreate(selector)
        .then(function(user) {
            //console.log('user ',user[0].dataValues);
            if(user[0] && user[0].dataValues){
                return cb(null, user[0].dataValues);
            }
            return cb({message:'Please try again'})
        }).catch(function (err) {
          return cb(err,null);
      });
  }
));

// Exporting our configured passport
module.exports = passport;
