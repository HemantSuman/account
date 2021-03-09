var express = require('express');
var router = express.Router();
var helper = require('../../helper');
var models = require('../../../models');
var ImageUpload = require('../../../middlewares/ImageUpload');
var async = require("async");
const { Op } = require('sequelize')

var extraVar = [];

var modelName = 'Payment';
var viewDirectory = 'payments';
var titleName = 'Add New Payment';

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

router.post('/getPurchasesByAccount', function(req, res, next) {
  req.where = {
    account_id: req.body.id, 
    [Op.not]: {
      payment_status: ["complete"]
    }
  };
  models.Purchase.getPurchasesByAccount(req, function (results) {
    res.json(results);
  });   
});

router.get('/add', function(req, res, next) {
  async.parallel({
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
    req.body.pay_date = helper.changeDateFormate(req.body.pay_date.trim(), "DD-MM-YYYY", "YYYY-MM-DD");
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
        if(!req.body.purchaseArr || req.body.purchaseArr.length <= 0){
          errorsItem = 
            {
              message: 'Select atleast one amount',
              type: 'Validation error',
              path: 'purchaseArr',
              value: '',
          };
          errors = errors.concat(errorsItem);
        }
        callback(null, errors);
      },
    ], function (err) {
      console.log(req.body)
      if (errors.length > 0) {
        res.status(400).send({status: false, msg: ' saved d failed', data: errors});
      } else {

        req.where = {
          id: {
            [Op.in]: req.body.purchaseArr
          }
        };
        req.order = [
          ['total_value'],
        ]
        models["Purchase"].getAllValues(req, function (results) {

          let remainingAmt = parseFloat(req.body.pay_amount);
          let payentArr = [];
          async.forEachOf(results, function (value1, key, callback1) {
            console.log("#", remainingAmt, value1.total_value, typeof remainingAmt, typeof value1.total_value);
            if(remainingAmt !== 0) {
              
              let payObj = {};
              let purchaseObj = {};
              purchaseObj.body = {};
              if(remainingAmt >= parseFloat(value1.total_value)){
                console.log("#Innnn");
                payObj.purchase_id = value1.id;
                payObj.account_id = req.body.account_id;
                payObj.pay_date = req.body.pay_date;
                payObj.pay_mode = req.body.pay_mode;
                payObj.pay_amount = value1.total_value;
                payObj.remark = req.body.remark;

                payentArr.push(payObj);
                remainingAmt = remainingAmt - parseFloat(value1.total_value);

                purchaseObj.body.payment_status = "complete";
                purchaseObj.body.id = value1.id;
                models["Purchase"].updateAllValues(purchaseObj, function (results1) {

                });

              } else if(remainingAmt < parseFloat(value1.total_value)){
                console.log("#elseeee");
                payObj.purchase_id = value1.id;
                payObj.account_id = req.body.account_id;
                payObj.pay_date = req.body.pay_date;
                payObj.pay_mode = req.body.pay_mode;
                payObj.pay_amount = remainingAmt;
                payObj.remark = req.body.remark;

                payentArr.push(payObj);
                remainingAmt = 0;

                purchaseObj.body.payment_status = "partial";
                purchaseObj.body.id = value1.id;
                console.log("#@", purchaseObj, payObj);
                models["Purchase"].updateAllValues(purchaseObj, function (results2) {

                });
              }
            }
            callback1();
          }, function (err) {
            if (err) {
              req.session.sessionFlash = {
                type: 'error',
                message: 'errorrr ............'
              }
              res.status(200).send({status: false, url: '/admin/' + viewDirectory});
            } else {
              models[modelName].saveAllBulkValues(payentArr, function (results3) {
                req.session.sessionFlash = {
                  type: 'success',
                  message: 'New record created successfully!'
                }
                res.status(200).send({status: true, url: '/admin/' + viewDirectory});
              });
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
