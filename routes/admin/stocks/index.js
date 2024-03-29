var express = require('express');
var router = express.Router();
var helper = require('../../helper');
var models = require('../../../models');
var ImageUpload = require('../../../middlewares/ImageUpload');
var async = require("async");
var moment = require('moment');
var pdf = require('html-pdf');
var ejs = require('ejs');
let path = require("path");

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

router.get('/add', PermissionModule.Permission('add', moduleSlug,  extraVar), function(req, res, next) {
  async.parallel({
    stockItemObj: function (callback) {
      req.where = {}
      models[modelName].getAllValues(req, function (data) {
        stockItemObj = {};
        data.map(function(val, index){
          if(val.sub_item_id){
            stockItemObj[val.sub_item_id+"_"+val.type] = val;
          } else{
            stockItemObj[val.item_id+"_"+val.type] = val;
          }            
        });
        callback(null, stockItemObj);
      });
    },
    items: function (callback) {
      req.where = {}
      models.Item.getAllValues(req, function (data) {
          callback(null, data);
      });
    },    
    subItems: function (callback) {
      req.where = {}
      models.SubItem.getAllValues(req, function (data) {
          callback(null, data);
      });
    },    
    // itemsSubItem: function (callback) {
    //   req.where = {}
    //   models.Item.getAllValues(req, function (data) {
    //     let itemsSubItem = {};
    //     data.map(function(v, i){
    //       itemsSubItem[v.id] = v.SubItems;
    //     })
    //     callback(null, itemsSubItem);
    //   });
    // },
  }, function (err, results) {
      extraVar['results'] = results;
      // extraVar['OtherTaxesIds'] = results.my_model.OtherTaxes.map(i => i.tax_id);
      console.log("####",results);
      res.render('admin/' + viewDirectory + '/add', {extraVar, layout: 'admin/layout/layout'});
  });
});

router.post('/add', PermissionModule.Permission('add', moduleSlug,  extraVar), function(req, res, next) {
  ImageUpload.uploadFile(req, res, function (err) {
    console.log(req.body)
    const addStockArr = [];
    async.forEachOf(req.body.id, function (value1, key, callback) {

      if(value1 !== ""){
        let stockDataUpdate = {};
        stockDataUpdate.body = {
          id: value1,
          quantity: req.body.quantity[key],
          type: req.body.type[key],
        };
        console.log("stockDataUpdate",stockDataUpdate);
        models.Stock.updateAllValues(stockDataUpdate, function (results) {
          callback();
        });

      } else if(req.body.quantity[key] != "") {
        let tempObj = {};

        tempObj.item_id = req.body.item_id[key];
        tempObj.sub_item_id = (req.body.sub_item_id[key] == '' ? null : req.body.sub_item_id[key]);
        tempObj.company_id = extraVar.siteVariable.session.user.Company.id;
        tempObj.quantity = req.body.quantity[key];
        tempObj.no_of_pkg = 1;
        tempObj.type = req.body.type[key];
        addStockArr.push(tempObj);
        callback();
      } else {
        callback();
      }

    }, function (err) {
      console.log("$$$", addStockArr)
      models.Stock.saveAllBulkValues(addStockArr, function (results){
        if(results.headerStatus){
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
              purchaseItemsObj[val.sub_item_id+'_purchase']['quantity'] = parseFloat(purchaseItemsObj[val.sub_item_id+'_purchase']['quantity']) + parseFloat(val.quantity);
              purchaseItemsObj[val.sub_item_id+'_purchase'] = purchaseItemsObj[val.sub_item_id+'_purchase'];

              if(helper.compareDate(helper.curDate('DD-MM-YYYY'), helper.changeDateFormate(val.createdAt.trim(), "YYYY-MM-DD", "DD-MM-YYYY"), 'DD-MM-YYYY') === 0){
                purchaseItemsObj[val.sub_item_id+'_purchase']['today'] = parseFloat(purchaseItemsObj[val.sub_item_id+'_purchase']['today']) + parseFloat(val.quantity);
              } else {
                purchaseItemsObj[val.sub_item_id+'_purchase']['old'] = parseFloat(purchaseItemsObj[val.sub_item_id+'_purchase']['old']) + parseFloat(val.quantity);
              }
              // purchaseItemsObj[val.sub_item_id+'_purchase'] = parseFloat(purchaseItemsObj[val.sub_item_id+'_purchase']) + parseFloat(val.quantity);
            } else {
              purchaseItemsObj[val.sub_item_id+'_purchase'] = {};
              purchaseItemsObj[val.sub_item_id+'_purchase']['quantity'] = parseFloat(val.quantity);
              purchaseItemsObj[val.sub_item_id+'_purchase']['today'] = 0;
              purchaseItemsObj[val.sub_item_id+'_purchase']['old'] = 0;

              if(helper.compareDate(helper.curDate('DD-MM-YYYY'), helper.changeDateFormate(val.createdAt.trim(), "YYYY-MM-DD", "DD-MM-YYYY"), 'DD-MM-YYYY') === 0){
                purchaseItemsObj[val.sub_item_id+'_purchase']['today'] = parseFloat(purchaseItemsObj[val.sub_item_id+'_purchase']['today']) + parseFloat(val.quantity);
              } else {
                purchaseItemsObj[val.sub_item_id+'_purchase']['old'] = parseFloat(purchaseItemsObj[val.sub_item_id+'_purchase']['old']) + parseFloat(val.quantity);
              }
              
            }
          } else {
            if(purchaseItemsObj[val.item_id+'_purchase']){
              purchaseItemsObj[val.item_id+'_purchase']['quantity'] = parseFloat(purchaseItemsObj[val.item_id+'_purchase']['quantity']) + parseFloat(val.quantity);
              purchaseItemsObj[val.item_id+'_purchase'] = purchaseItemsObj[val.item_id+'_purchase'];

              if(helper.compareDate(helper.curDate('DD-MM-YYYY'), helper.changeDateFormate(val.createdAt.trim(), "YYYY-MM-DD", "DD-MM-YYYY"), 'DD-MM-YYYY') === 0){
                purchaseItemsObj[val.item_id+'_purchase']['today'] = parseFloat(purchaseItemsObj[val.item_id+'_purchase']['today']) + parseFloat(val.quantity);
              } else {
                purchaseItemsObj[val.item_id+'_purchase']['old'] = parseFloat(purchaseItemsObj[val.item_id+'_purchase']['old']) + parseFloat(val.quantity);
              }
              // purchaseItemsObj[val.item_id+'_purchase'] = parseFloat(purchaseItemsObj[val.item_id+'_purchase']) + parseFloat(val.quantity);
            } else {
              purchaseItemsObj[val.item_id+'_purchase'] = {};
              purchaseItemsObj[val.item_id+'_purchase']['quantity'] = parseFloat(val.quantity);
              purchaseItemsObj[val.item_id+'_purchase']['today'] = 0;
              purchaseItemsObj[val.item_id+'_purchase']['old'] = 0;

              if(helper.compareDate(helper.curDate('DD-MM-YYYY'), helper.changeDateFormate(val.createdAt.trim(), "YYYY-MM-DD", "DD-MM-YYYY"), 'DD-MM-YYYY') === 0){
                console.log(val.item_id+'_purchase', val.quantity)
                purchaseItemsObj[val.item_id+'_purchase']['today'] = parseFloat(purchaseItemsObj[val.item_id+'_purchase']['today']) + parseFloat(val.quantity);
              } else {
                purchaseItemsObj[val.item_id+'_purchase']['old'] = parseFloat(purchaseItemsObj[val.item_id+'_purchase']['old']) + parseFloat(val.quantity);
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
              productionItemsObj[val.sub_item_id+'_production']['quantity'] = parseFloat(productionItemsObj[val.sub_item_id+'_production']['quantity']) + parseFloat(val.quantity);
              productionItemsObj[val.sub_item_id+'_production'] = productionItemsObj[val.sub_item_id+'_production'];

              if(helper.compareDate(helper.curDate('DD-MM-YYYY'), helper.changeDateFormate(val.createdAt.trim(), "YYYY-MM-DD", "DD-MM-YYYY"), 'DD-MM-YYYY') === 0){
                productionItemsObj[val.sub_item_id+'_production']['today'] = parseFloat(productionItemsObj[val.sub_item_id+'_production']['today']) + parseFloat(val.quantity);
              } else {
                productionItemsObj[val.sub_item_id+'_production']['old'] = parseFloat(productionItemsObj[val.sub_item_id+'_production']['old']) + parseFloat(val.quantity);
              }
              // productionItemsObj[val.sub_item_id+'_production'] = parseFloat(productionItemsObj[val.sub_item_id+'_production']) + parseFloat(val.quantity);
            } else {
              productionItemsObj[val.sub_item_id+'_production'] = {};
              productionItemsObj[val.sub_item_id+'_production']['quantity'] = parseFloat(val.quantity);
              productionItemsObj[val.sub_item_id+'_production']['today'] = 0;
              productionItemsObj[val.sub_item_id+'_production']['old'] = 0;

              if(helper.compareDate(helper.curDate('DD-MM-YYYY'), helper.changeDateFormate(val.createdAt.trim(), "YYYY-MM-DD", "DD-MM-YYYY"), 'DD-MM-YYYY') === 0){
                productionItemsObj[val.sub_item_id+'_production']['today'] = parseFloat(productionItemsObj[val.sub_item_id+'_production']['today']) + parseFloat(val.quantity);
              } else {
                productionItemsObj[val.sub_item_id+'_production']['old'] = parseFloat(productionItemsObj[val.sub_item_id+'_production']['old']) + parseFloat(val.quantity);
              }
            }            
          } else {
            if(productionItemsObj[val.item_id+'_production']){
              productionItemsObj[val.item_id+'_production']['quantity'] = parseFloat(productionItemsObj[val.item_id+'_production']['quantity']) + parseFloat(val.quantity);
              productionItemsObj[val.item_id+'_production'] = productionItemsObj[val.item_id+'_production'];

              if(helper.compareDate(helper.curDate('DD-MM-YYYY'), helper.changeDateFormate(val.createdAt.trim(), "YYYY-MM-DD", "DD-MM-YYYY"), 'DD-MM-YYYY') === 0){
                productionItemsObj[val.item_id+'_production']['today'] = parseFloat(productionItemsObj[val.item_id+'_production']['today']) + parseFloat(val.quantity);
              } else {
                productionItemsObj[val.item_id+'_production']['old'] = parseFloat(productionItemsObj[val.item_id+'_production']['old']) + parseFloat(val.quantity);
              }
              // productionItemsObj[val.item_id+'_production'] = parseFloat(productionItemsObj[val.item_id+'_production']) + parseFloat(val.quantity);
            } else {
              productionItemsObj[val.item_id+'_production'] = {};
              productionItemsObj[val.item_id+'_production']['quantity'] = parseFloat(val.quantity);
              productionItemsObj[val.item_id+'_production']['today'] = 0;
              productionItemsObj[val.item_id+'_production']['old'] = 0;

              if(helper.compareDate(helper.curDate('DD-MM-YYYY'), helper.changeDateFormate(val.createdAt.trim(), "YYYY-MM-DD", "DD-MM-YYYY"), 'DD-MM-YYYY') === 0){
                productionItemsObj[val.item_id+'_production']['today'] = parseFloat(productionItemsObj[val.item_id+'_production']['today']) + parseFloat(val.quantity);
              } else {
                productionItemsObj[val.item_id+'_production']['old'] = parseFloat(productionItemsObj[val.item_id+'_production']['old']) + parseFloat(val.quantity);
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
              invoiceItemsObj[val.sub_item_id+'_'+val.type]['quantity'] = parseFloat(invoiceItemsObj[val.sub_item_id+'_'+val.type]['quantity']) + parseFloat(val.quantity);
              invoiceItemsObj[val.sub_item_id+'_'+val.type] = invoiceItemsObj[val.sub_item_id+'_'+val.type];

              if(helper.compareDate(helper.curDate('DD-MM-YYYY'), helper.changeDateFormate(val.createdAt.trim(), "YYYY-MM-DD", "DD-MM-YYYY"), 'DD-MM-YYYY') === 0){
                invoiceItemsObj[val.sub_item_id+'_'+val.type]['today'] = parseFloat(invoiceItemsObj[val.sub_item_id+'_'+val.type]['today']) + parseFloat(val.quantity);
              } else {
                invoiceItemsObj[val.sub_item_id+'_'+val.type]['old'] = parseFloat(invoiceItemsObj[val.sub_item_id+'_'+val.type]['old']) + parseFloat(val.quantity);
              }
              // invoiceItemsObj[val.sub_item_id+'_'+val.type] = parseFloat(invoiceItemsObj[val.sub_item_id+'_'+val.type]) + parseFloat(val.quantity);
            } else {
              // invoiceItemsObj[val.sub_item_id+'_'+val.type] = {};
              // invoiceItemsObj[val.sub_item_id+'_'+val.type]['quantity'] = parseFloat(val.quantity);
              invoiceItemsObj[val.sub_item_id+'_'+val.type] = {};
              invoiceItemsObj[val.sub_item_id+'_'+val.type]['quantity'] = parseFloat(val.quantity);
              invoiceItemsObj[val.sub_item_id+'_'+val.type]['today'] = 0;
              invoiceItemsObj[val.sub_item_id+'_'+val.type]['old'] = 0;

              if(helper.compareDate(helper.curDate('DD-MM-YYYY'), helper.changeDateFormate(val.createdAt.trim(), "YYYY-MM-DD", "DD-MM-YYYY"), 'DD-MM-YYYY') === 0){
                invoiceItemsObj[val.sub_item_id+'_'+val.type]['today'] = parseFloat(invoiceItemsObj[val.sub_item_id+'_'+val.type]['today']) + parseFloat(val.quantity);
              } else {
                invoiceItemsObj[val.sub_item_id+'_'+val.type]['old'] = parseFloat(invoiceItemsObj[val.sub_item_id+'_'+val.type]['old']) + parseFloat(val.quantity);
              }
            }
          } else {
            if(invoiceItemsObj[val.item_id+'_'+val.type]) {
              invoiceItemsObj[val.item_id+'_'+val.type]['quantity'] = parseFloat(invoiceItemsObj[val.item_id+'_'+val.type]['quantity']) + parseFloat(val.quantity);
              invoiceItemsObj[val.item_id+'_'+val.type] = invoiceItemsObj[val.item_id+'_'+val.type];

              if(helper.compareDate(helper.curDate('DD-MM-YYYY'), helper.changeDateFormate(val.createdAt.trim(), "YYYY-MM-DD", "DD-MM-YYYY"), 'DD-MM-YYYY') === 0){
                invoiceItemsObj[val.item_id+'_'+val.type]['today'] = parseFloat(invoiceItemsObj[val.item_id+'_'+val.type]['today']) + parseFloat(val.quantity);
              } else {
                invoiceItemsObj[val.item_id+'_'+val.type]['old'] = parseFloat(invoiceItemsObj[val.item_id+'_'+val.type]['old']) + parseFloat(val.quantity);
              }
              // invoiceItemsObj[val.item_id+'_'+val.type] = parseFloat(invoiceItemsObj[val.item_id+'_'+val.type]) + parseFloat(val.quantity);
            } else {
              // invoiceItemsObj[val.item_id+'_'+val.type] = {};
              // invoiceItemsObj[val.item_id+'_'+val.type]['quantity'] = parseFloat(val.quantity);
              invoiceItemsObj[val.item_id+'_'+val.type] = {};
              invoiceItemsObj[val.item_id+'_'+val.type]['quantity'] = parseFloat(val.quantity);
              invoiceItemsObj[val.item_id+'_'+val.type]['today'] = 0;
              invoiceItemsObj[val.item_id+'_'+val.type]['old'] = 0;

              if(helper.compareDate(helper.curDate('DD-MM-YYYY'), helper.changeDateFormate(val.createdAt.trim(), "YYYY-MM-DD", "DD-MM-YYYY"), 'DD-MM-YYYY') === 0){
                invoiceItemsObj[val.item_id+'_'+val.type]['today'] = parseFloat(invoiceItemsObj[val.item_id+'_'+val.type]['today']) + parseFloat(val.quantity);
              } else {
                invoiceItemsObj[val.item_id+'_'+val.type]['old'] = parseFloat(invoiceItemsObj[val.item_id+'_'+val.type]['old']) + parseFloat(val.quantity);
              }
            }            
          }
        });
        callback2();
        // res.render('admin/'+viewDirectory+'/stock_movement', {results, extraVar, helper, layout:'admin/layout/layout' });
      });      
    },
    function (callback) {
      req.where = {};
      models['Item'].getAllValues(req, function (data2) {
        data2.map(function(val2){
          itemKeyValue[val2.id] = val2.item_name;
        });
        callback();
      });     
    },
    function (callback) {
      req.where = {};
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
        tmpObj.sale = parseFloat(invoiceItemsObj[key]['quantity']);
        tmpObj.oldOut = parseFloat(invoiceItemsObj[key]['old']);
        tmpObj.todayOut = parseFloat(invoiceItemsObj[key]['today']);
        tmpObj.remaining = parseFloat(value.quantity) - parseFloat(invoiceItemsObj[key]['quantity']);
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
        extraVar['helper'] = helper;
        console.log("@@@@@@@@@@@@@@@@", req.query)
        if(req.query.submit == 'print_day_book'){

          ejs.renderFile(path.join('views/admin/'+viewDirectory+'/', "day_book_template.ejs"), {extraVar: extraVar}, (err, data) => {
            console.log(err)
            if (err) {
                  res.send(err);
            } else {
                let options = {
                  "format": "A4", 
                  // "orientation": "portrait",
                  // "width": "400px",
                  // "header": {
                  //     "height": "55mm"
                  // },
                  "footer": {
                      "height": "45mm",
                  },
                };
                pdf.create(data, options).toFile("public/reports/day-book-template.pdf", function (err, data) {
                    if (err) {
                        res.send(err);
                    } else {
                      // fs.open('public/invoices/report.pdf', function (err, file) {
                      //   if (err) throw err;
                      //   console.log('Saved!');
                      // });
                        console.log(data);
                        res.redirect("/reports/day-book-template.pdf");
                        // res.send("File created successfully");
                    }
                });
            }
          });
        } else {
          res.render('admin/'+viewDirectory+'/stock_movement', {extraVar, helper, layout:'admin/layout/layout' });
        }
      }
    });
  });

     
});

module.exports = router;
