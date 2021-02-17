var express = require('express');
var router = express.Router();
var helper = require('../../helper');
var models = require('../../../models');
var ImageUpload = require('../../../middlewares/ImageUpload');
var async = require("async");

var extraVar = [];

var modelName = 'FinishedItem';
var viewDirectory = 'finished_items';
var titleName = 'Add new finished item';

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
  models[modelName].getAllValues(req, function (results) {
    res.render('admin/'+viewDirectory+'/index', {results, extraVar, helper, layout:'admin/layout/layout' });
  });   
});

router.post('/getByItemId', function(req, res, next) {
  req.where = {item_id: req.body.id};
  models[modelName].getValuesByItem(req, function (results) {
    res.json(results);
    // res.render('admin/'+viewDirectory+'/index', {results, extraVar, helper, layout: false });
  });   
});

module.exports = router;
