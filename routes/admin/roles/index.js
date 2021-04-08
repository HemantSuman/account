var express = require('express');
var router = express.Router();
var helper = require('../../helper');
var models = require('../../../models');
var ImageUpload = require('../../../middlewares/ImageUpload');
var async = require("async");

var extraVar = [];

var modelName = 'Role';
var viewDirectory = 'roles';
var titleName = 'Add new roles';

extraVar['modelName'] = modelName;
extraVar['viewDirectory'] = viewDirectory;
extraVar['titleName'] = titleName;
var moduleSlug = "roles";
var PermissionModule = require('../../../middlewares/Permission');

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
  models[modelName].getAllValues(req, function (results) {
    res.render('admin/'+viewDirectory+'/index', {results, extraVar, helper, layout:'admin/layout/layout' });
  });   
});

router.get('/add', PermissionModule.Permission('add', moduleSlug,  extraVar), function(req, res, next) {
  req.where = {};    
  res.render('admin/'+viewDirectory+'/add', { extraVar,helper, layout:'admin/layout/layout' });
});

router.post('/add', PermissionModule.Permission('add', moduleSlug,  extraVar), function(req, res, next) {
  ImageUpload.uploadFile(req, res, function (err) {
    var modelBuild = models[modelName].build(req.body);
    var errors = [];
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

router.get('/edit/:id', PermissionModule.Permission('edit', moduleSlug,  extraVar), function(req, res, next) {

  var id = req.params.id;
  async.parallel({
    my_model: function (callback) {
        req.where = {'id': id}
        models[modelName].getFirstValues(req, function (data) {
            callback(null, data);
        });
    },
    modules: function (callback) {
        req.where = {}
        models['Module'].getAllValues(req, function (data) {
            callback(null, data);
        });
    }
  }, function (err, results) {
      permissionKeyValue = {};
      results.my_model.Permissions.map(function(val, index){
        permissionKeyValue[val.module_id] = val;
      });
      extraVar["permissionKeyValue"] = permissionKeyValue;
      console.log("@@@@@@",extraVar.permissionKeyValue);
      res.render('admin/' + viewDirectory + '/edit', {results, extraVar, layout: 'admin/layout/layout'});
  });
});

router.post('/edit', PermissionModule.Permission('edit', moduleSlug,  extraVar), function(req, res, next) {
  
  ImageUpload.uploadFile(req, res, function (err) {
    let permissionArr = [];
    req.body.permissions.map(function(val, index){
      let permissionObj = {};
      permissionObj.role_id = val.role_id;
      permissionObj.module_id = val.module_id;
      permissionObj.add = val.add ? 1 : 0;
      permissionObj.edit = val.edit ? 1 : 0;
      permissionObj.view = val.view ? 1 : 0;
      permissionObj.delete = val.delete ? 1 : 0;
      permissionArr.push(permissionObj);
    });
    req.where = {'role_id': req.body.id};
    models["Permission"].deleteAllValues(req, function (data) {
      models["Permission"].saveAllBulkValues(permissionArr, function (results) {
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
    });
  });  
});

router.post('/delete/:id', PermissionModule.Permission('delete', moduleSlug,  extraVar), function (req, res, next) {
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
