var express = require('express');
var router = express.Router();
var helper = require('../../helper');
var models = require('../../../models');
var ImageUpload = require('../../../middlewares/ImageUpload');
var async = require("async");

var extraVar = [];

var modelName = 'Company';
var viewDirectory = 'companies';
var titleName = 'Add new company';

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

router.get('/', function(req, res, next) {
  req.where = {};
  models[modelName].getAllValues(req, function (results) {
    res.render('admin/'+viewDirectory+'/index', {results, extraVar, helper, layout:'admin/layout/layout' });
  });   
});

router.get('/add', function(req, res, next) {
  async.parallel({
    states: function (callback) {
        req.where = {}
        models.State.getAllValues(req, function (data) {
            callback(null, data);
        });
    },
  }, function (err, results) {
    extraVar['results'] = results;
    res.render('admin/'+viewDirectory+'/add', { extraVar,helper, layout:'admin/layout/layout' });
  });
});

router.post('/add', function(req, res, next) {
  ImageUpload.uploadFile(req, res, function (err) {
    var modelBuild = models[modelName].build(req.body);
    var errors = [];
    if(req.body.status && req.body.status === 'on'){
      req.body.status = 1;
    } else {
      req.body.status = 0;
    }
    async.parallel([
      function (callback) {

        modelBuild.validate()
        .then(function(){
          callback(null);
        })
        .catch(function (err){
          if (err != null) {
              errors = errors.concat(err.errors);
              callback(null, errors);
          } else {
              callback(null, errors);
          }
        })        
      }
    ], function (err) {
      if (errors.length > 0) {
        res.status(400).send({status: false, msg: ' saved d failed', data: errors});
      } else {        
        models[modelName].saveAllValues(req, function (results) {
          if(results.headerStatus) {
            req.session.sessionFlash = {
              type: 'success',
              message: 'New record created successfully!'
            }
            res.status(200).send({status: true, url: '/admin/' + viewDirectory});
          } else {
            req.session.sessionFlash = {
              type: 'success',
              message: 'errorrr ............'
            }
            res.status(200).send({status: true, url: '/admin/' + viewDirectory});
          }
        });
      }
    })
  });  
});

router.get('/edit/:id', function(req, res, next) {

  var id = req.params.id;
  async.parallel({
    my_model: function (callback) {
        req.where = {'id': id}
        models[modelName].getFirstValues(req, function (data) {
            callback(null, data);
        });
    },
    states: function (callback) {
      req.where = {}
      models.State.getAllValues(req, function (data) {
          callback(null, data);
      });
    }    
  }, function (err, results) {
      // req.where = {state_id: results.my_model.state_id}
      // models.City.getAllValues(req, function (data) {
      //   results.cities = data;
        extraVar['results'] = results;
        res.render('admin/' + viewDirectory + '/edit', {extraVar, layout: 'admin/layout/layout'});
      // });      
  });
});

router.post('/edit', function(req, res, next) {
  ImageUpload.uploadFile(req, res, function (err) {

    var modelBuild = models[modelName].build(req.body);
    var errors = [];
    if(req.body.status && req.body.status === 'on'){
      req.body.status = 1;
    } else {
      req.body.status = 0;
    }
    async.parallel([
      function (callback) {

        modelBuild.validate()
        .then(function(){
          callback(null);
        })
        .catch(function (err){
          if (err != null) {
              errors = errors.concat(err.errors);
              callback(null, errors);
          } else {
              callback(null, errors);
          }
        });        
      }
    ], function (err) {
      if (errors.length > 0) {
        res.status(400).send({status: false, msg: ' saved d failed', data: errors});
      } else {

        models[modelName].updateAllValues(req, function (results) {
          if(results.headerStatus) {
            req.session.sessionFlash = {
              type: 'success',
              message: 'Record updated successfully!'
            }
            res.status(200).send({status: true, url: '/admin/' + viewDirectory});
          } else {
            req.session.sessionFlash = {
              type: 'success',
              message: 'errorrr ............'
            }
            res.status(200).send({status: true, url: '/admin/' + viewDirectory});
          }
        });
      }
    })

  });  
});

router.post('/delete/:id', function (req, res, next) {
  var id = req.params.id;
  req.where = {'id': id};
  models[modelName].deleteAllValues(req, function (data) {
    req.session.sessionFlash = {
      type: 'success',
      message: 'Deleted successfully!'
    }
    res.status(200).send({status: true, url: '/admin/' + viewDirectory});
  });
});

module.exports = router;
