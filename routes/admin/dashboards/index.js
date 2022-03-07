var express = require('express');
var router = express.Router();
var helper = require('../../helper');
var models = require('../../../models');
var ImageUpload = require('../../../middlewares/ImageUpload');
var async = require("async");
const bcrypt = require('bcrypt');
const saltRounds = 10;

var extraVar = [];

var modelName = 'User';
var viewDirectory = 'dashboards';
var titleName = 'Add New User';
var moduleSlug = "users";
var PermissionModule = require('../../../middlewares/Permission');

extraVar['modelName'] = modelName;
extraVar['viewDirectory'] = viewDirectory;
extraVar['titleName'] = titleName;

var adminAuth = require('../../../middlewares/Auth');
router.use(adminAuth.isLogin);

router.use(function(req, res, next) {
  extraVar['siteVariable'] = req.siteVariable;
  next();
});

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('admin/index', { helper, layout:'admin/layout/layout' });
// });

router.get('/', PermissionModule.Permission('view', moduleSlug,  extraVar), function(req, res, next) {
  req.where = {};
  // models[modelName].getAllValues(req, function (results) {
    res.render('admin/'+viewDirectory+'/index', {extraVar, helper, layout:'admin/layout/layout' });
  // });   
});


module.exports = router;
