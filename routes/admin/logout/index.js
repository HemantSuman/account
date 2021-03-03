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
  req.logout();
  req.session.destroy();
  // req.app.locals.loginUser = false;
  res.redirect('/admin/login');  
});

module.exports = router;
