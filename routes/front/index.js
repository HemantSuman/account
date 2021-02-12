var express = require('express');
var router = express.Router();
var helper = require('../helper');
var models = require('../../models');
var async = require("async");
const { Op } = require("sequelize");

var extraVar = [];

var modelName = 'Menu';
var viewDirectory = 'front';
var titleName = 'Add new menu';

extraVar['modelName'] = modelName;
extraVar['viewDirectory'] = viewDirectory;
extraVar['titleName'] = titleName;

router.use(function(req, res, next) {
  next();
});

router.get('/category/:id', function(req, res, next) {
  let id = req.params.id;

  async.parallel({
    posts: function (callback) {
        req.where = {'category_id': id}
        models.Post.getAllValues(req, function (data) {
            callback(null, data);
        });
    },
    menus: function (callback) {
      req.where = {menu_id:0}
      req.orderBy = ['order', 'ASC'],
      models.Menu.getMenusForFront(req, function (data) {
          callback(null, data);
      });
    },
  }, function (err, results) {
    extraVar['results'] = results;
    res.render(viewDirectory+'/category', { extraVar,helper, layout:'front/layout/layout' });
  })  
});

router.get('/news/:id', function(req, res, next) {
  let id = req.params.id;

  async.parallel({
    posts: function (callback) {
        req.where = {'id': id}
        models.Post.getFirstValues(req, function (data) {
            callback(null, data);
        });
    },
    menus: function (callback) {
      req.where = {menu_id:0}
      req.orderBy = ['order', 'ASC'],
      models.Menu.getMenusForFront(req, function (data) {
          callback(null, data);
      });
    },
  }, function (err, results) {
    extraVar['results'] = results;
    res.render(viewDirectory+'/news', { extraVar,helper, layout:'front/layout/layout' });
  })  
});

router.get('/', function(req, res, next) {
  res.redirect('/admin/categories')
  // async.parallel({
  //   categories: function (callback) {
  //       req.where = {}
  //       models.Category.getCategoryForFront(req, function (data) {
  //           callback(null, data);
  //       });
  //   },
  //   menus: function (callback) {
  //       req.where = {menu_id:0}
  //       req.orderBy = ['order', 'ASC'],
  //       models.Menu.getMenusForFront(req, function (data) {
  //           callback(null, data);
  //       });
  //   },
  // }, function (err, results) {
  //   console.log(results.categories);
  //   extraVar['results'] = results;
  //   res.render(viewDirectory, { extraVar,helper, layout:'front/layout/layout' });
  // })  
});



module.exports = router;
