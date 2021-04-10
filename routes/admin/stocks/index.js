var express = require('express');
var router = express.Router();
var helper = require('../../helper');
var models = require('../../../models');
var ImageUpload = require('../../../middlewares/ImageUpload');
var async = require("async");
var moment = require('moment');

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
  let purchaseItemsObj = {};
  let productionItemsObj = {};
  let invoiceItemsObj = {};
  let itemKeyValue = {};
  async.parallel([
    function (callback1) {
      req.where = {};
      
      models.PurchaseItems.getAllValues(req, function (results) {
        results.map(function(val, index){
          if(val.sub_item_id){
            if(purchaseItemsObj[val.sub_item_id+'_purchase']){
              purchaseItemsObj[val.sub_item_id+'_purchase']['quantity'] = parseInt(purchaseItemsObj[val.sub_item_id+'_purchase']['quantity']) + parseInt(val.quantity);
              purchaseItemsObj[val.sub_item_id+'_purchase'] = purchaseItemsObj[val.sub_item_id+'_purchase'];

              if(helper.compareDate(helper.curDate('DD-MM-YYYY'), helper.changeDateFormate(val.createdAt.trim(), "YYYY-MM-DD", "DD-MM-YYYY"), 'DD-MM-YYYY') === 0){
                purchaseItemsObj[val.sub_item_id+'_purchase']['today'] = parseInt(purchaseItemsObj[val.sub_item_id+'_purchase']['today']) + parseInt(val.quantity);
              } else {
                purchaseItemsObj[val.sub_item_id+'_purchase']['old'] = parseInt(purchaseItemsObj[val.sub_item_id+'_purchase']['old']) + parseInt(val.quantity);
              }
              // purchaseItemsObj[val.sub_item_id+'_purchase'] = parseInt(purchaseItemsObj[val.sub_item_id+'_purchase']) + parseInt(val.quantity);
            } else {
              purchaseItemsObj[val.sub_item_id+'_purchase'] = {};
              purchaseItemsObj[val.sub_item_id+'_purchase']['quantity'] = parseInt(val.quantity);
              purchaseItemsObj[val.sub_item_id+'_purchase']['today'] = 0;
              purchaseItemsObj[val.sub_item_id+'_purchase']['old'] = 0;

              if(helper.compareDate(helper.curDate('DD-MM-YYYY'), helper.changeDateFormate(val.createdAt.trim(), "YYYY-MM-DD", "DD-MM-YYYY"), 'DD-MM-YYYY') === 0){
                purchaseItemsObj[val.sub_item_id+'_purchase']['today'] = parseInt(purchaseItemsObj[val.sub_item_id+'_purchase']['today']) + parseInt(val.quantity);
              } else {
                purchaseItemsObj[val.sub_item_id+'_purchase']['old'] = parseInt(purchaseItemsObj[val.sub_item_id+'_purchase']['old']) + parseInt(val.quantity);
              }
              
            }
          } else {
            if(purchaseItemsObj[val.item_id+'_purchase']){
              purchaseItemsObj[val.item_id+'_purchase']['quantity'] = parseInt(purchaseItemsObj[val.item_id+'_purchase']['quantity']) + parseInt(val.quantity);
              purchaseItemsObj[val.item_id+'_purchase'] = purchaseItemsObj[val.item_id+'_purchase'];

              if(helper.compareDate(helper.curDate('DD-MM-YYYY'), helper.changeDateFormate(val.createdAt.trim(), "YYYY-MM-DD", "DD-MM-YYYY"), 'DD-MM-YYYY') === 0){
                purchaseItemsObj[val.item_id+'_purchase']['today'] = parseInt(purchaseItemsObj[val.item_id+'_purchase']['today']) + parseInt(val.quantity);
              } else {
                purchaseItemsObj[val.item_id+'_purchase']['old'] = parseInt(purchaseItemsObj[val.item_id+'_purchase']['old']) + parseInt(val.quantity);
              }
              // purchaseItemsObj[val.item_id+'_purchase'] = parseInt(purchaseItemsObj[val.item_id+'_purchase']) + parseInt(val.quantity);
            } else {
              purchaseItemsObj[val.item_id+'_purchase'] = {};
              purchaseItemsObj[val.item_id+'_purchase']['quantity'] = parseInt(val.quantity);
              purchaseItemsObj[val.item_id+'_purchase']['today'] = 0;
              purchaseItemsObj[val.item_id+'_purchase']['old'] = 0;

              if(helper.compareDate(helper.curDate('DD-MM-YYYY'), helper.changeDateFormate(val.createdAt.trim(), "YYYY-MM-DD", "DD-MM-YYYY"), 'DD-MM-YYYY') === 0){
                console.log(val.item_id+'_purchase', val.quantity)
                purchaseItemsObj[val.item_id+'_purchase']['today'] = parseInt(purchaseItemsObj[val.item_id+'_purchase']['today']) + parseInt(val.quantity);
              } else {
                purchaseItemsObj[val.item_id+'_purchase']['old'] = parseInt(purchaseItemsObj[val.item_id+'_purchase']['old']) + parseInt(val.quantity);
              }
            }
          }
        });
        callback1();
        // res.render('admin/'+viewDirectory+'/stock_movement', {results, extraVar, helper, layout:'admin/layout/layout' });
      });      
    },
    function (callback2) {
      req.where = {};
      
      models.Production.getAllValues(req, function (results) {
        results.map(function(val, index){
          if(val.sub_item_id){
            if(productionItemsObj[val.sub_item_id+'_production']){
              productionItemsObj[val.sub_item_id+'_production']['quantity'] = parseInt(productionItemsObj[val.sub_item_id+'_production']['quantity']) + parseInt(val.quantity);
              productionItemsObj[val.sub_item_id+'_production'] = productionItemsObj[val.sub_item_id+'_production'];

              if(helper.compareDate(helper.curDate('DD-MM-YYYY'), helper.changeDateFormate(val.createdAt.trim(), "YYYY-MM-DD", "DD-MM-YYYY"), 'DD-MM-YYYY') === 0){
                productionItemsObj[val.sub_item_id+'_production']['today'] = parseInt(productionItemsObj[val.sub_item_id+'_production']['today']) + parseInt(val.quantity);
              } else {
                productionItemsObj[val.sub_item_id+'_production']['old'] = parseInt(productionItemsObj[val.sub_item_id+'_production']['old']) + parseInt(val.quantity);
              }
              // productionItemsObj[val.sub_item_id+'_production'] = parseInt(productionItemsObj[val.sub_item_id+'_production']) + parseInt(val.quantity);
            } else {
              productionItemsObj[val.sub_item_id+'_production'] = {};
              productionItemsObj[val.sub_item_id+'_production']['quantity'] = parseInt(val.quantity);
              productionItemsObj[val.sub_item_id+'_production']['today'] = 0;
              productionItemsObj[val.sub_item_id+'_production']['old'] = 0;

              if(helper.compareDate(helper.curDate('DD-MM-YYYY'), helper.changeDateFormate(val.createdAt.trim(), "YYYY-MM-DD", "DD-MM-YYYY"), 'DD-MM-YYYY') === 0){
                productionItemsObj[val.sub_item_id+'_production']['today'] = parseInt(productionItemsObj[val.sub_item_id+'_production']['today']) + parseInt(val.quantity);
              } else {
                productionItemsObj[val.sub_item_id+'_production']['old'] = parseInt(productionItemsObj[val.sub_item_id+'_production']['old']) + parseInt(val.quantity);
              }
            }            
          } else {
            if(productionItemsObj[val.item_id+'_production']){
              productionItemsObj[val.item_id+'_production']['quantity'] = parseInt(productionItemsObj[val.item_id+'_production']['quantity']) + parseInt(val.quantity);
              productionItemsObj[val.item_id+'_production'] = productionItemsObj[val.item_id+'_production'];

              if(helper.compareDate(helper.curDate('DD-MM-YYYY'), helper.changeDateFormate(val.createdAt.trim(), "YYYY-MM-DD", "DD-MM-YYYY"), 'DD-MM-YYYY') === 0){
                productionItemsObj[val.item_id+'_production']['today'] = parseInt(productionItemsObj[val.item_id+'_production']['today']) + parseInt(val.quantity);
              } else {
                productionItemsObj[val.item_id+'_production']['old'] = parseInt(productionItemsObj[val.item_id+'_production']['old']) + parseInt(val.quantity);
              }
              // productionItemsObj[val.item_id+'_production'] = parseInt(productionItemsObj[val.item_id+'_production']) + parseInt(val.quantity);
            } else {
              productionItemsObj[val.item_id+'_production'] = {};
              productionItemsObj[val.item_id+'_production']['quantity'] = parseInt(val.quantity);
              productionItemsObj[val.item_id+'_production']['today'] = 0;
              productionItemsObj[val.item_id+'_production']['old'] = 0;

              if(helper.compareDate(helper.curDate('DD-MM-YYYY'), helper.changeDateFormate(val.createdAt.trim(), "YYYY-MM-DD", "DD-MM-YYYY"), 'DD-MM-YYYY') === 0){
                productionItemsObj[val.item_id+'_production']['today'] = parseInt(productionItemsObj[val.item_id+'_production']['today']) + parseInt(val.quantity);
              } else {
                productionItemsObj[val.item_id+'_production']['old'] = parseInt(productionItemsObj[val.item_id+'_production']['old']) + parseInt(val.quantity);
              }
            }
          }
        });
        callback2();
        // res.render('admin/'+viewDirectory+'/stock_movement', {results, extraVar, helper, layout:'admin/layout/layout' });
      });      
    },
    function (callback2) {
      req.where = {};
      
      models.InvoiceItem.getAllValues(req, function (results) {
        results.map(function(val, index){
          if(val.sub_item_id){
            if(invoiceItemsObj[val.sub_item_id+'_'+val.type]){
              invoiceItemsObj[val.sub_item_id+'_'+val.type]['quantity'] = parseInt(invoiceItemsObj[val.sub_item_id+'_'+val.type]['quantity']) + parseInt(val.quantity);
              invoiceItemsObj[val.sub_item_id+'_'+val.type] = invoiceItemsObj[val.sub_item_id+'_'+val.type];

              if(helper.compareDate(helper.curDate('DD-MM-YYYY'), helper.changeDateFormate(val.createdAt.trim(), "YYYY-MM-DD", "DD-MM-YYYY"), 'DD-MM-YYYY') === 0){
                invoiceItemsObj[val.sub_item_id+'_'+val.type]['today'] = parseInt(invoiceItemsObj[val.sub_item_id+'_'+val.type]['today']) + parseInt(val.quantity);
              } else {
                invoiceItemsObj[val.sub_item_id+'_'+val.type]['old'] = parseInt(invoiceItemsObj[val.sub_item_id+'_'+val.type]['old']) + parseInt(val.quantity);
              }
              // invoiceItemsObj[val.sub_item_id+'_'+val.type] = parseInt(invoiceItemsObj[val.sub_item_id+'_'+val.type]) + parseInt(val.quantity);
            } else {
              // invoiceItemsObj[val.sub_item_id+'_'+val.type] = {};
              // invoiceItemsObj[val.sub_item_id+'_'+val.type]['quantity'] = parseInt(val.quantity);
              invoiceItemsObj[val.sub_item_id+'_'+val.type] = {};
              invoiceItemsObj[val.sub_item_id+'_'+val.type]['quantity'] = parseInt(val.quantity);
              invoiceItemsObj[val.sub_item_id+'_'+val.type]['today'] = 0;
              invoiceItemsObj[val.sub_item_id+'_'+val.type]['old'] = 0;

              if(helper.compareDate(helper.curDate('DD-MM-YYYY'), helper.changeDateFormate(val.createdAt.trim(), "YYYY-MM-DD", "DD-MM-YYYY"), 'DD-MM-YYYY') === 0){
                invoiceItemsObj[val.sub_item_id+'_'+val.type]['today'] = parseInt(invoiceItemsObj[val.sub_item_id+'_'+val.type]['today']) + parseInt(val.quantity);
              } else {
                invoiceItemsObj[val.sub_item_id+'_'+val.type]['old'] = parseInt(invoiceItemsObj[val.sub_item_id+'_'+val.type]['old']) + parseInt(val.quantity);
              }
            }
          } else {
            if(invoiceItemsObj[val.item_id+'_'+val.type]) {
              invoiceItemsObj[val.item_id+'_'+val.type]['quantity'] = parseInt(invoiceItemsObj[val.item_id+'_'+val.type]['quantity']) + parseInt(val.quantity);
              invoiceItemsObj[val.item_id+'_'+val.type] = invoiceItemsObj[val.item_id+'_'+val.type];

              if(helper.compareDate(helper.curDate('DD-MM-YYYY'), helper.changeDateFormate(val.createdAt.trim(), "YYYY-MM-DD", "DD-MM-YYYY"), 'DD-MM-YYYY') === 0){
                invoiceItemsObj[val.item_id+'_'+val.type]['today'] = parseInt(invoiceItemsObj[val.item_id+'_'+val.type]['today']) + parseInt(val.quantity);
              } else {
                invoiceItemsObj[val.item_id+'_'+val.type]['old'] = parseInt(invoiceItemsObj[val.item_id+'_'+val.type]['old']) + parseInt(val.quantity);
              }
              // invoiceItemsObj[val.item_id+'_'+val.type] = parseInt(invoiceItemsObj[val.item_id+'_'+val.type]) + parseInt(val.quantity);
            } else {
              // invoiceItemsObj[val.item_id+'_'+val.type] = {};
              // invoiceItemsObj[val.item_id+'_'+val.type]['quantity'] = parseInt(val.quantity);
              invoiceItemsObj[val.item_id+'_'+val.type] = {};
              invoiceItemsObj[val.item_id+'_'+val.type]['quantity'] = parseInt(val.quantity);
              invoiceItemsObj[val.item_id+'_'+val.type]['today'] = 0;
              invoiceItemsObj[val.item_id+'_'+val.type]['old'] = 0;

              if(helper.compareDate(helper.curDate('DD-MM-YYYY'), helper.changeDateFormate(val.createdAt.trim(), "YYYY-MM-DD", "DD-MM-YYYY"), 'DD-MM-YYYY') === 0){
                invoiceItemsObj[val.item_id+'_'+val.type]['today'] = parseInt(invoiceItemsObj[val.item_id+'_'+val.type]['today']) + parseInt(val.quantity);
              } else {
                invoiceItemsObj[val.item_id+'_'+val.type]['old'] = parseInt(invoiceItemsObj[val.item_id+'_'+val.type]['old']) + parseInt(val.quantity);
              }
            }            
          }
        });
        callback2();
        // res.render('admin/'+viewDirectory+'/stock_movement', {results, extraVar, helper, layout:'admin/layout/layout' });
      });      
    },
    function (callback) {
      models['Item'].getAllValues(req, function (data2) {
        data2.map(function(val2){
          itemKeyValue[val2.id] = val2.item_name;
        });
        callback();
      });     
    },
    function (callback) {
      models['SubItem'].getAllValues(req, function (data2) {
        data2.map(function(val2){
          itemKeyValue[val2.id] = val2.name;
        });
        callback();
      });     
    },
  ], function (err) {

    let stockIn = {...purchaseItemsObj, ...productionItemsObj};
    console.log('in', stockIn);
    console.log('out', invoiceItemsObj);
    let remainingStock = [];
    async.forEachOf(stockIn, function (value, key, cb){
      let tmpObj = {};
      let arr = key.split('_');
      tmpObj.item_id = arr[0];
      tmpObj.type = arr[1];
      tmpObj.todayIn = value.today;
      tmpObj.oldIn = value.old;
      

      if(invoiceItemsObj[key]){
        tmpObj.sale = parseInt(invoiceItemsObj[key]['quantity']);
        tmpObj.oldOut = parseInt(invoiceItemsObj[key]['old']);
        tmpObj.todayOut = parseInt(invoiceItemsObj[key]['today']);
        tmpObj.remaining = parseInt(value.quantity) - parseInt(invoiceItemsObj[key]['quantity']);
      } else {
        tmpObj.sale = 0;
        tmpObj.oldOut = 0;
        tmpObj.todayOut = 0;
        tmpObj.remaining = value.quantity;
      }
      remainingStock.push(tmpObj);
      cb();
    }, function (err) {
      if (err) {
        console.error(err);
        callback();
      } else {
        console.error("next", remainingStock);
        extraVar['remainingStock'] = remainingStock;
        extraVar['itemKeyValue'] = itemKeyValue;
        res.render('admin/'+viewDirectory+'/stock_movement', {extraVar, helper, layout:'admin/layout/layout' });
      }
    });
  });

     
});

module.exports = router;
