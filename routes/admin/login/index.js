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
  req.where = {};
  models.Company.getAllValues(req, function (results) {
    extraVar['companies'] = results;
    res.render('admin/'+viewDirectory+'/login', { extraVar, helper, layout: false });
  });  
});

// router.get('/login', function(req, res, next) {
//   res.render('admin/'+viewDirectory+'/login', { extraVar,helper, layout: false });
// });

router.post('/', function(req, res, next) {

  passport.authenticate('local', function (err, user, info) {
    if (err) {
        return next(err);
    }
    if (!user) {
      res.status(201).send({status: false, msg: "Invalid email or password", data: []});
    } else {
      req.logIn(user, function (err) {
          if (err) {
              console.log(err);
          }
          res.status(201).send({status: true, msg: 'login done', 'url': 'dashboards', data: []});
      });
    }

  })(req, res, next);

});

module.exports = router;
