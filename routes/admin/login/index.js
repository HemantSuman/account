var express = require('express');
var router = express.Router();
var helper = require('../../helper');
var models = require('../../../models');
var ImageUpload = require('../../../middlewares/ImageUpload');
var async = require("async");
const bcrypt = require('bcrypt');
const saltRounds = 10;
var passport = require('passport');
var extraVar = [];

var modelName = 'User';
var viewDirectory = 'users';
var titleName = 'Add New User';

extraVar['modelName'] = modelName;
extraVar['viewDirectory'] = viewDirectory;
extraVar['titleName'] = titleName;

router.use(function(req, res, next) {
  extraVar['siteVariable'] = req.siteVariable;
  next();
});


/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('admin/index', { helper, layout:'admin/layout/layout' });
// });

router.get('/', function(req, res, next) {
  res.render('admin/'+viewDirectory+'/login', { extraVar,helper, layout: false });
});

// router.get('/login', function(req, res, next) {
//   res.render('admin/'+viewDirectory+'/login', { extraVar,helper, layout: false });
// });

router.post('/', function(req, res, next) {
  console.log("####", req.body)

  passport.authenticate('local', function (err, user, info) {
    console.log('user', user, err)
    if (err) {
        return next(err);
    }
    if (!user) {
        //return res.redirect('/login');
        res.status(201).send({status: false, msg: "Invalid email or password", data: []});
    } else {
        if (user.is_complete_registration == 1 && user.is_active == 0) {
            res.status(201).send({status: false, msg: 'Your account is inactive. Contact your administrator to activate it.', data: []});
        } else {
            req.logIn(user, function (err) {
                if (err) {
                    //return next(err); 
                    //console.log(err);
                }
                res.status(201).send({status: true, msg: 'login done', 'url': 'dashboard', data: []});
            });

        }
    }

  })(req, res, next);

});

module.exports = router;
