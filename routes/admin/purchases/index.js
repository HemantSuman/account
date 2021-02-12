var express = require('express');
var router = express.Router();
var helper = require('../../helper');
var models = require('../../../models');
var ImageUpload = require('../../../middlewares/ImageUpload');
var async = require("async");

var extraVar = [];

var modelName = 'Purchase';
var viewDirectory = 'purchases';
var titleName = 'Add New Purchase';

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

router.get('/add', function(req, res, next) {
  async.parallel({
    items: function (callback) {
        req.where = {}
        models.Item.getAllValues(req, function (data) {
            callback(null, data);
        });
    },    
    accounts: function (callback) {
        req.where = {}
        models.Account.getAllValues(req, function (data) {
            callback(null, data);
        });
    },    
  }, function (err, results) {
    extraVar['results'] = results;
    res.render('admin/'+viewDirectory+'/add', { extraVar,helper, layout:'admin/layout/layout' });
  })  
});

router.post('/add', function(req, res, next) {
  ImageUpload.uploadFile(req, res, function (err) {
    let modelBuild = models[modelName].build(req.body);
    
    let errors = [];
    if(req.body.status && req.body.status === 'on'){
      req.body.status = 1;
    } else {
      req.body.status = 0;
    }
    req.body.purchase_invoice_date = helper.changeDateFormate(req.body.purchase_invoice_date.trim(), "DD-MM-YYYY", "YYYY-MM-DD");
    req.body.to_be_pay_upto_date = helper.changeDateFormate(req.body.to_be_pay_upto_date.trim(), "DD-MM-YYYY", "YYYY-MM-DD");
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
      },
      function (callback) {
        async.forEachOf(req.body.item, function (value1, key, callback1) {
          var modelBuildPurchaseItems = models.PurchaseItems.build(value1);

          modelBuildPurchaseItems.validate()
          .then(function (err) {
              callback1(null, errors);              
          })
          .catch(function (err){
            if (err != null) {
                async.forEachOf(err.errors, function (errObj, callback2) {
                  errObj.path = "item"+"_"+errObj.path+"_" + key;
                  errors = errors.concat(errObj);
                });
                callback1(null, errors);
            } else {
                callback1(null, errors);
            }
          });
        }, function (err) {
            callback(null, errors);
        });  
      }      
    ], function (err) {
      if (errors.length > 0) {
        res.status(400).send({status: false, msg: ' saved d failed', data: errors});
      } else {
        models[modelName].saveAllValues(req, function (results) {

          async.parallel([
            function(callback) {
              if(results.id){
                let bulkData = [];
                async.forEachOf(req.body.item, function (value1, key, callback1) {
                  if(typeof  value1 != "undefined"){
                    if(value1.sub_item_id === ""){
                      value1.sub_item_id = null;
                    }
                    value1.purchase_id = results.id;
                    bulkData.push(value1);                  
                  }
                  callback1(null);
                }, function (err) {
                  if (err) {
                    console.error(err.message);
                  } else {
                    models.PurchaseItems.saveAllBulkValues(bulkData, function (results){
                      callback(null);
                    });
                  }
                });
              } else {
                callback({status: false})
              }
            },
            function(callback) {
              if(results.id){
                let bulkData = [];
                async.forEachOf(req.body.item, function (value1, key, callback1) {
                  if(typeof  value1 != "undefined"){
                    
                    let stockData = {
                      item_id: value1.item_id,
                      purchase_id: results.id,
                      sub_item_id: value1.sub_item_id !== "" ? value1.sub_item_id : null,
                      quantity: value1.quantity,
                      no_of_pkg: value1.no_of_pkg,
                    };
                    bulkData.push(stockData);                  
                  }
                  callback1(null);
                }, function (err) {
                  if (err) {
                    console.error(err.message);
                  } else {
                    models.Stock.saveAllBulkValues(bulkData, function (results){
                      callback(null);
                    });
                  }
                });                              
              } else {
                callback({status: false})
              }
            }
          ],
          function(err, results) {
            if(err === null){
              req.session.sessionFlash = {
                type: 'success',
                message: 'New record created successfully!'
              }
              res.status(200).send({status: true, url: '/admin/' + viewDirectory});
            } else {
              req.session.sessionFlash = {
                type: 'error',
                message: 'errorrr ............'
              }
              res.status(200).send({status: false, url: '/admin/' + viewDirectory});
            }
          });
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
    categories: function (callback) {
      req.where = {}
      models.Category.getAllValues(req, function (data) {
          callback(null, data);
      });
    },
  }, function (err, results) {
      extraVar['results'] = results;
      res.render('admin/' + viewDirectory + '/edit', {extraVar, layout: 'admin/layout/layout'});
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
