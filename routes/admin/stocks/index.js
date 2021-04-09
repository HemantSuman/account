var express = require('express');
var router = express.Router();
var helper = require('../../helper');
var models = require('../../../models');
var ImageUpload = require('../../../middlewares/ImageUpload');
var async = require("async");

var extraVar = [];

var modelName = 'Stock';
var viewDirectory = 'stocks';
var titleName = 'Add new stock';
var moduleSlug = "stocks";
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

router.get('/', PermissionModule.Permission('view', moduleSlug,  extraVar), function(req, res, next) {
  req.where = {};
  models[modelName].getAllValues(req, function (results) {
    console.log(results)
    res.render('admin/'+viewDirectory+'/index', {results, extraVar, helper, layout:'admin/layout/layout' });
  });   
});

router.post('/getByItemId', function(req, res, next) {
  req.where = {item_id: req.body.id, sub_item_id: null, type: req.body.type};
  models[modelName].getFirstValues(req, function (results) {
    res.json(results);
  });   
});

router.post('/getBySubItemId', function(req, res, next) {
  req.where = {sub_item_id: req.body.id, type: req.body.type};
  models[modelName].getFirstValues(req, function (results) {
    res.json(results);
  });   
});

router.get('/stock_movement', PermissionModule.Permission('view', moduleSlug,  extraVar), function(req, res, next) {
  req.where = {};
  models[modelName].getAllValues(req, function (results) {
    console.log(results)
    res.render('admin/'+viewDirectory+'/stock_movement', {results, extraVar, helper, layout:'admin/layout/layout' });
  });   
});

module.exports = router;
