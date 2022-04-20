var express = require('express');
var router = express.Router();
var helper = require('../../helper');
var models = require('../../../models');
var ImageUpload = require('../../../middlewares/ImageUpload');
var async = require("async");
const reader = require('xlsx')
const { Op } = require('sequelize');
var pdf = require('html-pdf');
var ejs = require('ejs');
let path = require("path");
var extraVar = [];

var modelName = 'Purchase';
var viewDirectory = 'reports';
var titleName = 'Add New Report';

extraVar['modelName'] = modelName;
extraVar['viewDirectory'] = viewDirectory;
extraVar['titleName'] = titleName;
var moduleSlug = "purchases";
var PermissionModule = require('../../../middlewares/Permission');

var adminAuth = require('../../../middlewares/Auth');
router.use(adminAuth.isLogin);

router.use(function(req, res, next) {
  extraVar['siteVariable'] = req.siteVariable;
  next();
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/admin/reports/purchase');
});

router.get('/sell', function(req, res, next) {
  async.parallel({
    invoices: function (callback) {
      req.where = {};
      if(req.query.from_date && req.query.to_date){


        req.query.from_date = helper.changeDateFormate(req.query.from_date.trim(), "DD-MM-YYYY", "YYYY-MM-DD");
        req.query.to_date = helper.changeDateFormate(req.query.to_date.trim(), "DD-MM-YYYY", "YYYY-MM-DD");
        req.where = {
          date: {
            [Op.between]: [req.query.from_date, req.query.to_date],
          }
        };
      }      
      models.Invoice.getAllValues(req, function (data) {
          callback(null, data);
      });
    },            
  }, function (err, results) {
    if(req.query.submit === "print"){
      // console.log("@@@", JSON.stringify(results)); return;
      extraVar['results'] = results;
      extraVar['helper'] = helper;
      ejs.renderFile(path.join('views/admin/reports/', "sell-template.ejs"), {extraVar: extraVar}, (err, data) => {
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
            pdf.create(data, options).toFile("public/reports/sell-report.pdf", function (err, data) {
                if (err) {
                    res.send(err);
                } else {
                  // fs.open('public/invoices/report.pdf', function (err, file) {
                  //   if (err) throw err;
                  //   console.log('Saved!');
                  // });
                    console.log(data);
                    res.redirect("/reports/sell-report.pdf");
                    // res.send("File created successfully");
                }
            });
        }
      });    
    } else if(req.query.submit === "xls"){
      let writeArr = [];
      
      
      async.forEachOf(results.invoices, function (value, key, callback) {
        if(value.InvoiceItems && value.InvoiceItems.length != 0){
          let qty = 0;
          async.forEachOf(value.InvoiceItems, function (value1, key1, callback1) {
            qty = qty + parseFloat(value1.quantity);
          })
          let writeObj = {};
          writeObj["Invoice Number"] = value.invoice_no;
          writeObj["Invoice Date"] = value.date;
          writeObj["Name"] = value.Consignee.account_name;
          writeObj["GSTIN/UIN of Recipient"] = value.Consignee.gstin;
          writeObj["State of Recipient"] = helper.gstStateCode()[value.Consignee.gstin.substring(0, 2)] + "-" + value.Consignee.gstin.substring(0, 2);
          writeObj["Invoice Value"] = Math.round(value.net_amount);
          writeObj["Rate %"] = value.InvoiceItems[0].gst;
          writeObj["Taxable Value"] = value.total_GST;
          writeObj["Integrated Tax Amount"] = value.igst_amount?parseFloat(value.igst_amount):"";
          writeObj["Central Tax Amount"] = value.cgst_amount?parseFloat(value.cgst_amount):"";
          writeObj["State/UT Tax Amount"] = value.sgst_amount?parseFloat(value.sgst_amount):"";
          writeObj["HSN"] = value.InvoiceItems[0].Item.hsn_code;
          writeObj["Description"] = value.InvoiceItems[0].description;
          writeObj["UQC"] = 'BOX';
          writeObj["Total Quantity"] = qty;
          writeArr.push(writeObj);
        }
        callback();
      }, function (err) {
        if (err) {
          console.error(err.message);
        } else {
          
          const ws = reader.utils.json_to_sheet(writeArr);
  
          let wb = reader.utils.book_new();
          reader.utils.book_append_sheet(wb, ws);
          reader.writeFile(wb, "public/invoices/sell-report.xlsx");
          res.redirect("/invoices/sell-report.xlsx");
        }
      });      
    } else {
      extraVar['results'] = results;
      
      if(req.query.from_date && req.query.to_date){
        //again convert date format for dispaly input - filled
        req.query.from_date = helper.changeDateFormate(req.query.from_date.trim(), "YYYY-MM-DD", "DD-MM-YYYY");
        req.query.to_date = helper.changeDateFormate(req.query.to_date.trim(), "YYYY-MM-DD", "DD-MM-YYYY");
        extraVar['query'] = req.query;
      } else {
        extraVar['query'] = {};
      }
      console.log("@!", extraVar.results.invoices)
      res.render('admin/'+viewDirectory+'/sell', { extraVar,helper, layout:'admin/layout/layout' });
    }
  })  
});

router.get('/purchase', function(req, res, next) {
  async.parallel({
    purchases: function (callback) {
      req.where = {};
      if(req.query.from_date && req.query.to_date){


        req.query.from_date = helper.changeDateFormate(req.query.from_date.trim(), "DD-MM-YYYY", "YYYY-MM-DD");
        req.query.to_date = helper.changeDateFormate(req.query.to_date.trim(), "DD-MM-YYYY", "YYYY-MM-DD");
        req.where = {
          purchase_invoice_date: {
            [Op.between]: [req.query.from_date, req.query.to_date],
          }
        };
      }      
      models.Purchase.getAllValues(req, function (data) {
          callback(null, data);
      });
    },            
  }, function (err, results) {

    if(req.query.submit === "print"){
      extraVar['results'] = results;
      extraVar['helper'] = helper;
      console.log("@@@@@@@", results.purchases[0].PurchaseItems);
      ejs.renderFile(path.join('views/admin/reports/', "purchase-template.ejs"), {extraVar: extraVar}, (err, data) => {
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
            pdf.create(data, options).toFile("public/reports/purchase-report.pdf", function (err, data) {
                if (err) {
                    res.send(err);
                } else {
                  // fs.open('public/invoices/report.pdf', function (err, file) {
                  //   if (err) throw err;
                  //   console.log('Saved!');
                  // });
                    console.log(data);
                    res.redirect("/reports/purchase-report.pdf");
                    // res.send("File created successfully");
                }
            });
        }
      });    
    } else if(req.query.submit === "xls"){
      let writeArr = [];
      async.forEachOf(results.purchases, function (value, key, callback) {
        let writeObj = {};
        writeObj["SNo."] = ++key;
        writeObj["Name"] = value.Account.account_name;
        writeObj["GST In"] = value.Account.gstin;
        writeObj["Date"] = value.purchase_invoice_date;
        writeObj["Invoice No."] = value.purchase_invoice_no;
        writeObj["HSN"] = value.PurchaseItems[0].Item.hsn_code;
        writeObj["Qty"] = Math.round(value.PurchaseItems[0].quantity);
        writeObj["Unit"] = value.PurchaseItems[0].Item.unit;
        
        writeObj["IGST"] = value.igst_amount?Math.round(value.igst_amount):"";
        writeObj["CGST"] = value.cgst_amount?Math.round(value.cgst_amount):"";
        writeObj["SGST"] = value.sgst_amount?Math.round(value.sgst_amount):"";
        writeObj["Total GST"] = value.igst_amount?Math.round(value.igst_amount) : Math.round(parseInt(value.cgst_amount) + parseInt(value.sgst_amount))

        writeObj["Total Value"] = value.total_value;
        writeArr.push(writeObj);
        callback();
      }, function (err) {
        if (err) {
          console.error(err.message);
        } else {
          const ws = reader.utils.json_to_sheet(writeArr);
  
          let wb = reader.utils.book_new();
          reader.utils.book_append_sheet(wb, ws);
          reader.writeFile(wb, "public/invoices/purchase-report.xlsx");
          res.redirect("/invoices/purchase-report.xlsx");
          // reader.utils.book_append_sheet(file,ws,"Sheet3");
          // reader.writeFile(file,'public/invoices/purchase-report.xlsx')
        }
      });      
    } else {
      extraVar['results'] = results;
      
      if(req.query.from_date && req.query.to_date){
        //again convert date format for dispaly input - filled
        req.query.from_date = helper.changeDateFormate(req.query.from_date.trim(), "YYYY-MM-DD", "DD-MM-YYYY");
        req.query.to_date = helper.changeDateFormate(req.query.to_date.trim(), "YYYY-MM-DD", "DD-MM-YYYY");
        extraVar['query'] = req.query;
      } else {
        extraVar['query'] = {};
      }
      res.render('admin/'+viewDirectory+'/purchase', { extraVar,helper, layout:'admin/layout/layout' });
    }
  })  
});

router.get('/gst2a', function(req, res, next) {
  async.parallel({
    purchases: function (callback) {
      req.where = {};
      if(req.query.from_date && req.query.to_date){


        req.query.from_date = helper.changeDateFormate(req.query.from_date.trim(), "DD-MM-YYYY", "YYYY-MM-DD");
        req.query.to_date = helper.changeDateFormate(req.query.to_date.trim(), "DD-MM-YYYY", "YYYY-MM-DD");
        req.where = {
          purchase_invoice_date: {
            [Op.between]: [req.query.from_date, req.query.to_date],
          }
        };
      }      
      models.Purchase.getAllValues(req, function (data) {
          callback(null, data);
      });
    },            
  }, function (err, results) {

    if(req.query.submit === "print"){
      let writeArr = [];
      async.forEachOf(results.purchases, function (value, key, callback) {
        let writeObj = {};
        writeObj["Invoice No."] = value.purchase_invoice_no;
        writeObj["Date"] = value.purchase_invoice_date;
        writeObj["Name"] = value.Account.account_name;
        writeObj["GST In"] = value.Account.gstin;
        writeObj["Total Value"] = value.total_value;
        writeObj["IGST"] = value.igst_amount?parseFloat(value.igst_amount):"";
        writeObj["CGST"] = value.cgst_amount?parseFloat(value.cgst_amount):"";
        writeObj["SGST"] = value.sgst_amount?parseFloat(value.sgst_amount):"";
        writeArr.push(writeObj);
        callback();
      }, function (err) {
        if (err) {
          console.error(err.message);
        } else {
          const ws = reader.utils.json_to_sheet(writeArr);
  
          let wb = reader.utils.book_new();
          reader.utils.book_append_sheet(wb, ws);
          reader.writeFile(wb, "public/invoices/gst2a-report.xlsx");
          res.redirect("/invoices/gst2a-report.xlsx");
        }
      });      
    } else {
      extraVar['results'] = results;
      
      if(req.query.from_date && req.query.to_date){
        //again convert date format for dispaly input - filled
        req.query.from_date = helper.changeDateFormate(req.query.from_date.trim(), "YYYY-MM-DD", "DD-MM-YYYY");
        req.query.to_date = helper.changeDateFormate(req.query.to_date.trim(), "YYYY-MM-DD", "DD-MM-YYYY");
        extraVar['query'] = req.query;
      } else {
        extraVar['query'] = {};
      }
      res.render('admin/'+viewDirectory+'/gst2a', { extraVar,helper, layout:'admin/layout/layout' });
    }
  })  
});

router.get('/edit-gst2a/:id', function(req, res, next) {

  var id = req.params.id;
  async.parallel({
    my_model: function (callback) {
        req.where = {'id': id}
        models[modelName].getFirstValues(req, function (data) {
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
      extraVar['OtherTaxesIds'] = results.my_model.OtherTaxes.map(i => i.tax_id);
      res.render('admin/' + viewDirectory + '/edit-gst2a', {extraVar, layout: 'admin/layout/layout'});
  });
});

router.post('/edit-gst2a', function(req, res, next) {
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
            res.status(200).send({status: true, url: '/admin/' + viewDirectory + '/gst2a'});
          } else {
            req.session.sessionFlash = {
              type: 'success',
              message: 'errorrr ............'
            }
            res.status(200).send({status: true, url: '/admin/' + viewDirectory + '/gst2a'});
          }
        });
      }
    })

  });  
});

router.get('/stock', function(req, res, next) {
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
            if(req.query.from_date && req.query.to_date){
                //again convert date format for dispaly input - filled
                req.query.from_date = helper.changeDateFormate(req.query.from_date.trim(), "YYYY-MM-DD", "DD-MM-YYYY");
                req.query.to_date = helper.changeDateFormate(req.query.to_date.trim(), "YYYY-MM-DD", "DD-MM-YYYY");
                extraVar['query'] = req.query;
            } else {
                extraVar['query'] = {};
            }
            res.render('admin/'+viewDirectory+'/stock_movement', {extraVar, helper, layout:'admin/layout/layout' });
        }
      }
    });
});
});

// router.get('/stock', function(req, res, next) {
//   async.parallel({
//     invoices: function (callback) {
//       req.where = {};
//       if(req.query.from_date && req.query.to_date){


//         req.query.from_date = helper.changeDateFormate(req.query.from_date.trim(), "DD-MM-YYYY", "YYYY-MM-DD");
//         req.query.to_date = helper.changeDateFormate(req.query.to_date.trim(), "DD-MM-YYYY", "YYYY-MM-DD");
//         req.where = {
//           createdAt: {
//             [Op.between]: [req.query.from_date, req.query.to_date],
//           }
//         };
//       }      
//       models.Stock.getAllValues(req, function (data) {
//           callback(null, data);
//       });
//     },            
//   }, function (err, results) {
//     // console.log("@@@", JSON.stringify(results)); return;
//     if(req.query.submit === "print"){
      
//       extraVar['results'] = results;
//       extraVar['helper'] = helper;
//       ejs.renderFile(path.join('views/admin/reports/', "stock-template.ejs"), {extraVar: extraVar}, (err, data) => {
//         console.log(err)
//         if (err) {
//               res.send(err);
//         } else {
//             let options = {
//               "format": "A4", 
//               // "orientation": "portrait",
//               // "width": "400px",
//               // "header": {
//               //     "height": "55mm"
//               // },
//               "footer": {
//                   "height": "45mm",
//               },
//             };
//             pdf.create(data, options).toFile("public/reports/stock-report.pdf", function (err, data) {
//                 if (err) {
//                     res.send(err);
//                 } else {
//                   // fs.open('public/invoices/report.pdf', function (err, file) {
//                   //   if (err) throw err;
//                   //   console.log('Saved!');
//                   // });
//                     console.log(data);
//                     res.redirect("/reports/stock-report.pdf");
//                     // res.send("File created successfully");
//                 }
//             });
//         }
//       });    
//     } else if(req.query.submit === "xls"){
//       let writeArr = [];
//       let qty = 0;
      
//       async.forEachOf(results.invoices, function (value, key, callback) {
//         console.log(value.InvoiceItems)
//         if(value.InvoiceItems && value.InvoiceItems.length != 0){
//           let writeObj = {};
//           qty = qty + value.InvoiceItems[0].quantity;
//           writeObj["Invoice Number"] = value.invoice_no;
//           writeObj["Invoice Date"] = value.date;
//           writeObj["Name"] = value.Consignee.account_name;
//           writeObj["GSTIN/UIN of Recipient"] = value.Consignee.gstin;
//           writeObj["Invoice Value"] = value.net_amount;
//           writeObj["Rate %"] = value.InvoiceItems[0].gst;
//           writeObj["Taxable Value"] = value.total_GST;
//           writeObj["Integrated Tax Amount"] = value.igst_amount?parseFloat(value.igst_amount):"";
//           writeObj["Central Tax Amount"] = value.cgst_amount?parseFloat(value.cgst_amount):"";
//           writeObj["State/UT Tax Amount"] = value.sgst_amount?parseFloat(value.sgst_amount):"";
//           writeObj["HSN"] = value.InvoiceItems[0].Item.hsn_code;
//           writeObj["Description"] = value.InvoiceItems[0].description;
//           writeObj["UQC"] = 'BOX';
//           writeObj["Total Quantity"] = qty;
//           writeArr.push(writeObj);
//         }
//         callback();
//       }, function (err) {
//         if (err) {
//           console.error(err.message);
//         } else {
          
//           const ws = reader.utils.json_to_sheet(writeArr);
  
//           let wb = reader.utils.book_new();
//           reader.utils.book_append_sheet(wb, ws);
//           reader.writeFile(wb, "public/invoices/sell-report.xlsx");
//           res.redirect("/invoices/sell-report.xlsx");
//         }
//       });      
//     } else {
//       extraVar['results'] = results;
      
//       if(req.query.from_date && req.query.to_date){
//         //again convert date format for dispaly input - filled
//         req.query.from_date = helper.changeDateFormate(req.query.from_date.trim(), "YYYY-MM-DD", "DD-MM-YYYY");
//         req.query.to_date = helper.changeDateFormate(req.query.to_date.trim(), "YYYY-MM-DD", "DD-MM-YYYY");
//         extraVar['query'] = req.query;
//       } else {
//         extraVar['query'] = {};
//       }
//       res.render('admin/'+viewDirectory+'/stock', { extraVar,helper, layout:'admin/layout/layout' });
//     }
//   })  
// });

router.get('/daily-production', function(req, res, next) {
  async.parallel({
    productions: function (callback) {
      req.where = {};
      if(req.query.date_of_production){


        req.query.date_of_production = helper.changeDateFormate(req.query.date_of_production.trim(), "DD-MM-YYYY", "YYYY-MM-DD");
        // req.query.to_date = helper.changeDateFormate(req.query.to_date.trim(), "DD-MM-YYYY", "YYYY-MM-DD");
        req.where = {
          date_of_production: req.query.date_of_production,
        };
      }      
      models.Production.getAllValues(req, function (data) {
          callback(null, data);
      });
    },            
  }, function (err, results) {
    // console.log("@@@", JSON.stringify(results)); return;
    if(req.query.submit === "print"){
      // console.log("@@@", JSON.stringify(results)); return;
      extraVar['results'] = results;
      extraVar['helper'] = helper;
      ejs.renderFile(path.join('views/admin/reports/', "daily-production-template.ejs"), {extraVar: extraVar}, (err, data) => {
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
            pdf.create(data, options).toFile("public/reports/daily-production-report.pdf", function (err, data) {
                if (err) {
                    res.send(err);
                } else {
                  // fs.open('public/invoices/report.pdf', function (err, file) {
                  //   if (err) throw err;
                  //   console.log('Saved!');
                  // });
                    // console.log(data);
                    res.redirect("/reports/daily-production-report.pdf");
                    // res.send("File created successfully");
                }
            });
        }
      });    
    } else if(req.query.submit === "xls"){
      let writeArr = [];
      
      
      async.forEachOf(results.productions, function (value, key, callback) {
          let writeObj = {};
          writeObj["Date"] = value.date_of_production;
          writeObj["Item"] = value.Item.item_name;
          writeObj["SubItem"] = value.SubItem?value.SubItem.name:"";
          writeObj["Brand"] = value.Brand.name;
          writeObj["Quantity"] = value.quantity;
          writeArr.push(writeObj);
        callback();
      }, function (err) {
        if (err) {
          console.error(err.message);
        } else {
          
          const ws = reader.utils.json_to_sheet(writeArr);
  
          let wb = reader.utils.book_new();
          reader.utils.book_append_sheet(wb, ws);
          reader.writeFile(wb, "public/reports/daily-production-report.xlsx");
          res.redirect("/reports/daily-production-report.xlsx");
        }
      });      
    } else {
      extraVar['results'] = results;
      
      if(req.query.date_of_production){
        //again convert date format for dispaly input - filled
        req.query.date_of_production = helper.changeDateFormate(req.query.date_of_production.trim(), "YYYY-MM-DD", "DD-MM-YYYY");
        extraVar['query'] = req.query;
      } else {
        extraVar['query'] = {};
      }
      res.render('admin/'+viewDirectory+'/daily-production', { extraVar,helper, layout:'admin/layout/layout' });
    }
  })  
});

router.get('/payment', function(req, res, next) {
  async.parallel({
    payments: function (callback) {
        req.where = {};
        models.Payment.getAllValues(req, function (data) {
            callback(null, data);
        });
    },
    payment_received: function (callback) {
        req.where = {};
        models.PaymentReceived.getAllValues(req, function (data) {
            callback(null, data);
        });
    },            
  }, function (err, results) {
    if(req.query.submit === "print"){
      extraVar['results'] = results;
      extraVar['helper'] = helper;
      ejs.renderFile(path.join('views/admin/reports/', "payment-template.ejs"), {extraVar: extraVar}, (err, data) => {
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
            pdf.create(data, options).toFile("public/reports/payment-report.pdf", function (err, data) {
                if (err) {
                    res.send(err);
                } else {
                  // fs.open('public/invoices/report.pdf', function (err, file) {
                  //   if (err) throw err;
                  //   console.log('Saved!');
                  // });
                    // console.log(data);
                    res.redirect("/reports/payment-report.pdf");
                    // res.send("File created successfully");
                }
            });
        }
      });    
    } else if(req.query.submit === "xls"){
      let writeArr = [];
      
      
      async.forEachOf(results.payments, function (value, key, callback) {
          let writeObj = {};
          writeObj["Type"] = "Paid";
          writeObj["Date"] = value.pay_date;
          writeObj["Mode"] = value.pay_mode;
          writeObj["Amount"] = value.pay_amount;
          if(extraVar.query.type == 'paid' || extraVar.query.type == 'both'){
            writeArr.push(writeObj);
          }
          callback();
      }, function (err) {
        if (err) {
          console.error(err.message);
        } else {
          
          async.forEachOf(results.payment_received, function (value1, key1, callback1) {
            let writeObj1 = {};
            writeObj1["Type"] = "Received";
            writeObj1["Date"] = value1.pay_date;
            writeObj1["Mode"] = value1.pay_mode;
            writeObj1["Amount"] = value1.pay_amount;
            if(extraVar.query.type == 'received' || extraVar.query.type == 'both'){
              writeArr.push(writeObj1);
            }
            callback1();
          }, function (err1) {
            const ws = reader.utils.json_to_sheet(writeArr);
  
            let wb = reader.utils.book_new();
            reader.utils.book_append_sheet(wb, ws);
            reader.writeFile(wb, "public/reports/payment-report.xlsx");
            res.redirect("/reports/payment-report.xlsx");
          })
        }
      });      
    } else {
      extraVar['results'] = results;
      
      if(req.query.type){
        extraVar['query'] = req.query;
      } else {
        extraVar['query'] = {type:"both"};
      }
      res.render('admin/'+viewDirectory+'/payment', { extraVar,helper, layout:'admin/layout/layout' });
    }
  })  
});

router.get('/party-wise', function(req, res, next) {
  async.parallel({
    groups: function (callback) {
      req.where = {}
      models.Group.getAllValues(req, function (data) {
          callback(null, data);
      });
    },
    accounts: function (callback) {
      if(req.query && req.query.group_id){
        req.where = {group_id: req.query.group_id}
      } else {
        req.where = {}
      }
      models.Account.getAllValues(req, function (data) {
          callback(null, data);
      });
    },
    payments: function (callback) {
        if(req.query && req.query.account_id){
          req.where = {account_id: req.query.account_id};
        } else {
          req.where = {};
        }
        models.Payment.getAllValues(req, function (data) {
            callback(null, data);
        });
    },
    payment_received: function (callback) {
        if(req.query && req.query.account_id){
          req.where = {account_id: req.query.account_id};
        } else {
          req.where = {};
        }
        models.PaymentReceived.getAllValues(req, function (data) {
            callback(null, data);
        });
    },            
  }, function (err, results) {
    
      let pay = JSON.parse(JSON.stringify(results.payments))
      let rec = JSON.parse(JSON.stringify(results.payment_received))
      let finalArr = pay.concat(rec);
      let temp = finalArr.sort(function(a,b){
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return new Date(b.paydate_string) - new Date(a.paydate_string);
      });
      // console.log("$$$$$", temp);
      extraVar['results'] = results;
      extraVar['results']["temp"] = temp;     

    if(req.query.submit === "print"){
       
      extraVar['helper'] = helper;
      ejs.renderFile(path.join('views/admin/reports/', "party-wise-template.ejs"), {extraVar: extraVar}, (err, data) => {
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
            pdf.create(data, options).toFile("public/reports/party-wise-report.pdf", function (err, data) {
                if (err) {
                    res.send(err);
                } else {
                  // fs.open('public/invoices/report.pdf', function (err, file) {
                  //   if (err) throw err;
                  //   console.log('Saved!');
                  // });
                    // console.log(data);
                    res.redirect("/reports/party-wise-report.pdf");
                    // res.send("File created successfully");
                }
            });
        }
      });    
    } else if(req.query.submit === "xls"){
      let writeArr = [];
      
      async.forEachOf(temp, function (value1, key1, callback1) {
        let writeObj1 = {};
        writeObj1["Party"] = value1.Account.account_name;
        writeObj1["Type"] = value1.pay_type;
        writeObj1["Date"] = value1.pay_date;
        writeObj1["Mode"] = value1.pay_mode;
        writeObj1["Debit"] = value1.pay_type == 'Received' ? value1.pay_amount: '';
        writeObj1["Credit"] = value1.pay_type == 'Paid' ? value1.pay_amount: '';
        writeArr.push(writeObj1);
        callback1();
      }, function (err1) {
        const ws = reader.utils.json_to_sheet(writeArr);

        let wb = reader.utils.book_new();
        reader.utils.book_append_sheet(wb, ws);
        reader.writeFile(wb, "public/reports/part-wise-report.xlsx");
        res.redirect("/reports/part-wise-report.xlsx");
      })
    } else {
      // extraVar['results'] = results;
      
      if(req.query.account_id){
        extraVar['query'] = req.query;
      } else {
        extraVar['query'] = {};
      }
      res.render('admin/'+viewDirectory+'/party-wise', { extraVar,helper, layout:'admin/layout/layout' });
    }
  })  
});

router.get('/day-book', function(req, res, next) {

  req.where = {};
  if(req.query.pay_date){

    req.query.pay_date = helper.changeDateFormate(req.query.pay_date.trim(), "DD-MM-YYYY", "YYYY-MM-DD");
    req.where = {
      pay_date: req.query.pay_date,
    };
  }
  async.parallel({
    payments: function (callback) {
        models.Payment.getAllValues(req, function (data) {
            callback(null, data);
        });
    },
    payment_received: function (callback) {
        models.PaymentReceived.getAllValues(req, function (data) {
            callback(null, data);
        });
    },            
  }, function (err, results) {
    if(req.query.submit === "print"){
      extraVar['results'] = results;
      extraVar['helper'] = helper;
      ejs.renderFile(path.join('views/admin/reports/', "day-book-template.ejs"), {extraVar: extraVar}, (err, data) => {
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
            pdf.create(data, options).toFile("public/reports/day-book-report.pdf", function (err, data) {
                if (err) {
                    res.send(err);
                } else {
                  // fs.open('public/invoices/report.pdf', function (err, file) {
                  //   if (err) throw err;
                  //   console.log('Saved!');
                  // });
                    // console.log(data);
                    res.redirect("/reports/day-book-report.pdf");
                    // res.send("File created successfully");
                }
            });
        }
      });    
    } else if(req.query.submit === "xls"){
      let writeArr = [];
      
      
      async.forEachOf(results.payments, function (value, key, callback) {
          let writeObj = {};
          writeObj["Date"] = value.pay_date;
          writeObj["Particulars"] = value.Account.account_name;
          writeObj["Type"] = "Payment";
          
          writeObj["Mode"] = value.pay_mode;
          writeObj["Debit"] = value.pay_amount;
          writeObj["Credit"] = "";
          writeArr.push(writeObj);
          callback();
      }, function (err) {
        if (err) {
          console.error(err.message);
        } else {
          
          async.forEachOf(results.payment_received, function (value1, key1, callback1) {
            let writeObj1 = {};
            writeObj1["Date"] = value1.pay_date;
            writeObj1["Particulars"] = value1.Account.account_name;
            writeObj1["Type"] = "Sales";
            
            writeObj1["Mode"] = value1.pay_mode;
            writeObj1["Debit"] = "";
            writeObj1["Credit"] = value1.pay_amount;
            writeArr.push(writeObj1);
            callback1();
          }, function (err1) {
            const ws = reader.utils.json_to_sheet(writeArr);
  
            let wb = reader.utils.book_new();
            reader.utils.book_append_sheet(wb, ws);
            reader.writeFile(wb, "public/reports/day-book-report.xlsx");
            res.redirect("/reports/day-book-report.xlsx");
          })
        }
      });      
    } else {
      extraVar['results'] = results;
      
      if(req.query.pay_date){
        //again convert date format for dispaly input - filled
        req.query.pay_date = helper.changeDateFormate(req.query.pay_date.trim(), "YYYY-MM-DD", "DD-MM-YYYY");
        extraVar['query'] = req.query;
      } else {
        extraVar['query'] = {};
      }
      res.render('admin/'+viewDirectory+'/day-book', { extraVar,helper, layout:'admin/layout/layout' });
    }
  })  
});

router.get('/purchase-item-type', function(req, res, next) {
  async.parallel({
    categories: function (callback) {
      req.where = {}
      models.Category.getAllValues(req, function (data) {
          callback(null, data);
      });
    },
    purchases: function (callback) {
      req.where = {};
      if(req.query.category_id){

        req.where = {'$PurchaseItems.Item.category_id$': req.query.category_id}
      }      
      models.Purchase.getAllValues(req, function (data) {
          callback(null, data);
      });
    },            
  }, function (err, results) {

    if(req.query.submit === "print"){
      extraVar['results'] = results;
      extraVar['helper'] = helper;
      ejs.renderFile(path.join('views/admin/reports/', "purchase-item-type-template.ejs"), {extraVar: extraVar}, (err, data) => {
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
            pdf.create(data, options).toFile("public/reports/purchase-item-type-report.pdf", function (err, data) {
                if (err) {
                    res.send(err);
                } else {
                  // fs.open('public/invoices/report.pdf', function (err, file) {
                  //   if (err) throw err;
                  //   console.log('Saved!');
                  // });
                    console.log(data);
                    res.redirect("/reports/purchase-item-type-report.pdf");
                    // res.send("File created successfully");
                }
            });
        }
      });    
    } else if(req.query.submit === "xls"){
      let writeArr = [];
      async.forEachOf(results.purchases, function (value, key, callback) {
        let writeObj = {};
        writeObj["SNo."] = ++key;
        writeObj["Invoice No."] = value.purchase_invoice_no;
        writeObj["Date"] = value.purchase_invoice_date;
        writeObj["Name"] = value.Account.account_name;
        writeObj["GST In"] = value.Account.gstin;
        writeObj["Total Value"] = Math.round(value.total_value);
        writeObj["IGST"] = value.igst_amount?Math.round(value.igst_amount):"";
        writeObj["CGST"] = value.cgst_amount?Math.round(value.cgst_amount):"";
        writeObj["SGST"] = value.sgst_amount?Math.round(value.sgst_amount):"";
        writeArr.push(writeObj);
        callback();
      }, function (err) {
        if (err) {
          console.error(err.message);
        } else {
          const ws = reader.utils.json_to_sheet(writeArr);
  
          let wb = reader.utils.book_new();
          reader.utils.book_append_sheet(wb, ws);
          reader.writeFile(wb, "public/invoices/purchase-item-wise-report.xlsx");
          res.redirect("/invoices/purchase-item-wise-report.xlsx");
          // reader.utils.book_append_sheet(file,ws,"Sheet3");
          // reader.writeFile(file,'public/invoices/purchase-report.xlsx')
        }
      });      
    } else {
      extraVar['results'] = results;
      
      if(req.query.category_id){
        extraVar['query'] = req.query;
      } else {
        extraVar['query'] = {};
      }
      res.render('admin/'+viewDirectory+'/purchase-item-type', { extraVar,helper, layout:'admin/layout/layout' });
    }
  })  
});

router.get('/production-item-type', function(req, res, next) {
  async.parallel({
    categories: function (callback) {
      req.where = {}
      models.Category.getAllValues(req, function (data) {
          callback(null, data);
      });
    },
    invoices: function (callback) {
      req.where = {};
      if(req.query.category_id){
        req.where = {'$InvoiceItems.Item.category_id$': req.query.category_id}
      }
      models.Invoice.getAllValues(req, function (data) {
          callback(null, data);
      });
    },            
  }, function (err, results) {

    if(req.query.submit === "print"){
      extraVar['results'] = results;
      extraVar['helper'] = helper;
      ejs.renderFile(path.join('views/admin/reports/', "production-item-type-template.ejs"), {extraVar: extraVar}, (err, data) => {
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
            pdf.create(data, options).toFile("public/reports/production-item-type-report.pdf", function (err, data) {
                if (err) {
                    res.send(err);
                } else {
                  // fs.open('public/invoices/report.pdf', function (err, file) {
                  //   if (err) throw err;
                  //   console.log('Saved!');
                  // });
                    console.log(data);
                    res.redirect("/reports/production-item-type-report.pdf");
                    // res.send("File created successfully");
                }
            });
        }
      });    
    } else if(req.query.submit === "xls"){
      let writeArr = [];
      async.forEachOf(results.purchases, function (value, key, callback) {
        let writeObj = {};
        writeObj["SNo."] = ++key;
        writeObj["Invoice No."] = value.purchase_invoice_no;
        writeObj["Date"] = value.purchase_invoice_date;
        writeObj["Name"] = value.Account.account_name;
        writeObj["GST In"] = value.Account.gstin;
        writeObj["Total Value"] = Math.round(value.total_value);
        writeObj["IGST"] = value.igst_amount?Math.round(value.igst_amount):"";
        writeObj["CGST"] = value.cgst_amount?Math.round(value.cgst_amount):"";
        writeObj["SGST"] = value.sgst_amount?Math.round(value.sgst_amount):"";
        writeArr.push(writeObj);
        callback();
      }, function (err) {
        if (err) {
          console.error(err.message);
        } else {
          const ws = reader.utils.json_to_sheet(writeArr);
  
          let wb = reader.utils.book_new();
          reader.utils.book_append_sheet(wb, ws);
          reader.writeFile(wb, "public/invoices/production-item-wise-report.xlsx");
          res.redirect("/invoices/production-item-wise-report.xlsx");
          // reader.utils.book_append_sheet(file,ws,"Sheet3");
          // reader.writeFile(file,'public/invoices/purchase-report.xlsx')
        }
      });      
    } else {
      extraVar['results'] = results;
      
      if(req.query.category_id){
        extraVar['query'] = req.query;
      } else {
        extraVar['query'] = {};
      }
      res.render('admin/'+viewDirectory+'/production-item-type', { extraVar,helper, layout:'admin/layout/layout' });
    }
  })  
});

module.exports = router;
