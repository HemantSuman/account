// var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var models = require('../models');
const bcrypt = require('bcrypt');
const saltRounds = 10;

module.exports = function (passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    // used to deserialize the user
    passport.deserializeUser(function (id, done) {
        //console.log(id);
        // models.User.getUserById(id, function (userData) {
        // console.log(userData);
        done(null, id);
        // });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    // passport.use(
    //         'local-signup',
    //         new LocalStrategy({
    //             // by default, local strategy uses username and password, we will override with email
    //             usernameField: 'username',
    //             passwordField: 'password',
    //             passReqToCallback: true // allows us to pass back the entire request to the callback
    //         },
    //         function (req, username, password, done) {
    //             // find a user whose email is the same as the forms email
    //             // we are checking to see if the user trying to login already exists
    //             connection.query("SELECT * FROM users WHERE username = ?", [username], function (err, rows) {
    //                 if (err)
    //                     return done(err);
    //                 if (rows.length) {
    //                     return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
    //                 } else {
    //                     // if there is no user with that username
    //                     // create the user
    //                     var newUserMysql = {
    //                         username: username,
    //                         password: bcrypt.hashSync(password, null, null)  // use the generateHash function in our user model
    //                     };

    //                     var insertQuery = "INSERT INTO users ( username, password ) values (?,?)";

    //                     connection.query(insertQuery, [newUserMysql.username, newUserMysql.password], function (err, rows) {
    //                         newUserMysql.id = rows.insertId;

    //                         return done(null, newUserMysql);
    //                     });
    //                 }
    //             });
    //         })
    //         );

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(
        'local',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },
        function (req, email, password, done) { // callback with email and password from our form

            console.log(req.body.company_id)
            models.User.getUserByEmail(email, function (rows) {
                req.where = {id: req.body.company_id};
                models.Company.getFirstValues(req, function (rows1) {
                    let results = {};
                    results.User = rows;
                    results.Company = rows1;

                    if (!results) {
                        return done(null, false, 'Invaild login details');
                    } else if (!bcrypt.compareSync(password, results.User.password)) {

                        return done(null, false, 'Invaild login details');
                    } else {
                        return done(null, results);
                    }

                });
            });

        })
    );
};