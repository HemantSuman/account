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
var moduleSlug = "payments";
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

router.get('/add', PermissionModule.Permission('add', moduleSlug,  extraVar), function(req, res, next) {
  async.parallel({
    accounts: function (callback) {
        req.where = {}
        models.Account.getAllValues(req, function (data) {
            callback(null, data);
        });
    },    
    payment_modes: function (callback) {
        req.where = {}
        models.PaymentMode.getAllValues(req, function (data) {
            callback(null, data);
        });
    },    
  }, function (err, results) {
    extraVar['results'] = results;
    res.render('admin/'+viewDirectory+'/add', { extraVar,helper, layout:'admin/layout/layout' });
  })  
});

router.post('/add', PermissionModule.Permission('add', moduleSlug,  extraVar), function(req, res, next) {
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


        let payentArr = {};
        payentArr.body = {};
        console.log("^^^^", req.body);
        // payentArr.body.purchase_id = value1.id;
        payentArr.body.account_id = req.body.account_id;
        payentArr.body.pay_date = req.body.pay_date;
        payentArr.body.pay_mode = req.body.pay_mode;
        payentArr.body.pay_amount = req.body.pay_amount;
        payentArr.body.remark = req.body.remark;
        models[modelName].saveAllValues(payentArr, function (results3) {

          req.where = {
            id: {
              [Op.in]: req.body.purchaseArr
            }
          };
          req.order = [
            [ models.sequelize.cast(models.sequelize.col('total_value'), 'SIGNED') , 'ASC' ]
          ]
          models["Purchase"].getAllValues(req, function (results) {
            
            let remainingAmt = parseFloat(req.body.pay_amount);
            let payentPur = [];
            async.forEachOf(results, function (value1, key, callback1) {
              if(remainingAmt !== 0) {
                
                let payObj = {};
                let purchaseObj = {};
                purchaseObj.body = {};
                if(remainingAmt >= parseFloat(value1.payment_remaining)){
                  console.log("#Innnn");
                  payObj.purchase_id = value1.id;
                  payObj.payment_id = results3.id;
                  payObj.pay_amount = value1.payment_remaining;
  
                  payentPur.push(payObj);
                  remainingAmt = remainingAmt - parseFloat(value1.payment_remaining);
  
                  purchaseObj.body.payment_status = "complete";
                  purchaseObj.body.payment_remaining = 0;
                  purchaseObj.body.id = value1.id;
                  models["Purchase"].updateAllValues(purchaseObj, function (results1) {
  
                  });
  
                } else if(remainingAmt < parseFloat(value1.payment_remaining)){
                  console.log("#elseeee", value1, remainingAmt, parseFloat(parseFloat(value1.payment_remaining) - parseFloat(remainingAmt)).toFixed(2));
                  payObj.purchase_id = value1.id;
                  payObj.payment_id = results3.id;
                  payObj.pay_amount = remainingAmt;                  
  
                  purchaseObj.body.payment_status = "partial";
                  purchaseObj.body.payment_remaining = parseFloat(parseFloat(value1.payment_remaining) - parseFloat(remainingAmt)).toFixed(2);
                  purchaseObj.body.id = value1.id;

                  payentPur.push(payObj);
                  remainingAmt = 0;
                  console.log("#@", purchaseObj, payObj);
                  models["Purchase"].updateAllValues(purchaseObj, function (results2) {
  
                  });
                }
              }
              callback1();
            }, function (err) {
              if (err) {
                res.status(400).send({status: false, msg: ' saved d failed', data: errors});
              } else {

                models["PaymentPurchase"].saveAllBulkValues(payentPur, function (results4) {
                  req.session.sessionFlash = {
                    type: 'success',
                    message: 'New record created successfully!'
                  }
                  res.status(200).send({status: true, url: '/admin/' + viewDirectory});
                });
              }
            });
          });
          // req.session.sessionFlash = {
          //   type: 'success',
          //   message: 'New record created successfully!'
          // }
          // res.status(200).send({status: true, url: '/admin/' + viewDirectory});
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

router.post('/edit', PermissionModule.Permission('edit', moduleSlug,  extraVar), function(req, res, next) {
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
