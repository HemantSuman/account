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

router.post('/getByItemId', function(req, res, next) {
  req.where = {item_id: req.body.id, sub_item_id: null, type: "production"};
  models[modelName].getFirstValues(req, function (results) {
    res.json(results);
  });   
});

router.post('/getBySubItemId', function(req, res, next) {
  req.where = {sub_item_id: req.body.id, type: "production"};
  models[modelName].getFirstValues(req, function (results) {
    res.json(results);
  });   
});

module.exports = router;
