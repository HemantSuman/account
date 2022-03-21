var express = require('express');
var router = express.Router();
var helper = require('../../helper');
var models = require('../../../models');
var ImageUpload = require('../../../middlewares/ImageUpload');
var async = require("async");
const { Op } = require('sequelize')

var extraVar = [];

var modelName = 'PaymentReceived';
var viewDirectory = 'payments_received';
var titleName = 'Add New Payment';
var moduleSlug = "payments_received";
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

router.post('/getInvoiceByAccount', function(req, res, next) {
  req.where = {
    consignee_no: req.body.id, 
    [Op.not]: {
      payment_status: ["complete"]
    }
  };
  models.Invoice.getInvoiceByAccount(req, function (results) {
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
        payentArr.body.company_id = extraVar.siteVariable.session.user.Company.id;
        models[modelName].saveAllValues(payentArr, function (results3) {

          req.where = {
            id: {
              [Op.in]: req.body.purchaseArr
            }
          };
          req.order = [
            [ models.sequelize.cast(models.sequelize.col('net_amount'), 'SIGNED') , 'ASC' ]
          ]
          models["Invoice"].getAllValues(req, function (results) {
            
            let remainingAmt = parseFloat(req.body.pay_amount);
            let payentPur = [];
            async.forEachOf(results, function (value1, key, callback1) {
              if(remainingAmt !== 0) {
                
                let payObj = {};
                let purchaseObj = {};
                purchaseObj.body = {};
                if(remainingAmt >= parseFloat(value1.payment_remaining)){
                  console.log("#Innnn");
                  payObj.invoice_id = value1.id;
                  payObj.payments_received_id = results3.id;
                  payObj.pay_amount = value1.payment_remaining;
                  payObj.company_id = extraVar.siteVariable.session.user.Company.id;
  
                  payentPur.push(payObj);
                  remainingAmt = remainingAmt - parseFloat(value1.payment_remaining);
  
                  purchaseObj.body.payment_status = "complete";
                  purchaseObj.body.payment_remaining = 0;
                  purchaseObj.body.id = value1.id;
                  models["Invoice"].updateAllValues(purchaseObj, function (results1) {
  
                  });
  
                } else if(remainingAmt < parseFloat(value1.payment_remaining)){
                  console.log("#elseeee", value1, remainingAmt, parseFloat(parseFloat(value1.payment_remaining) - parseFloat(remainingAmt)).toFixed(2));
                  payObj.invoice_id = value1.id;
                  payObj.payments_received_id = results3.id;
                  payObj.pay_amount = remainingAmt;                  
                  payObj.company_id = extraVar.siteVariable.session.user.Company.id;;                  
  
                  purchaseObj.body.payment_status = "partial";
                  purchaseObj.body.payment_remaining = parseFloat(parseFloat(value1.payment_remaining) - parseFloat(remainingAmt)).toFixed(2);
                  purchaseObj.body.id = value1.id;

                  payentPur.push(payObj);
                  remainingAmt = 0;
                  console.log("#@", purchaseObj, payObj);
                  models["Invoice"].updateAllValues(purchaseObj, function (results2) {
  
                  });
                }
              }
              callback1();
            }, function (err) {
              if (err) {
                res.status(400).send({status: false, msg: ' saved d failed', data: errors});
              } else {

                models["PaymentReceivedInvoice"].saveAllBulkValues(payentPur, function (results4) {
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


module.exports = router;
