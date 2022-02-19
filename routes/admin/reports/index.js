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
  res.redirect('/admin/reports/accounts');
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
      let qty = 0;
      
      async.forEachOf(results.invoices, function (value, key, callback) {
        console.log(value.InvoiceItems)
        if(value.InvoiceItems && value.InvoiceItems.length != 0){
          let writeObj = {};
          qty = qty + parseFloat(value.InvoiceItems[0].quantity);
          writeObj["Invoice Number"] = value.invoice_no;
          writeObj["Invoice Date"] = value.date;
          writeObj["Name"] = value.Consignee.account_name;
          writeObj["GSTIN/UIN of Recipient"] = helper.gstStateCode()[value.Consignee.gstin.substring(0, 2)];
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

router.get('/accounts', function(req, res, next) {
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
      res.render('admin/'+viewDirectory+'/accounts', { extraVar,helper, layout:'admin/layout/layout' });
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
  async.parallel({
    invoices: function (callback) {
      req.where = {};
      if(req.query.from_date && req.query.to_date){


        req.query.from_date = helper.changeDateFormate(req.query.from_date.trim(), "DD-MM-YYYY", "YYYY-MM-DD");
        req.query.to_date = helper.changeDateFormate(req.query.to_date.trim(), "DD-MM-YYYY", "YYYY-MM-DD");
        req.where = {
          createdAt: {
            [Op.between]: [req.query.from_date, req.query.to_date],
          }
        };
      }      
      models.Stock.getAllValues(req, function (data) {
          callback(null, data);
      });
    },            
  }, function (err, results) {
    // console.log("@@@", JSON.stringify(results)); return;
    if(req.query.submit === "print"){
      
      extraVar['results'] = results;
      extraVar['helper'] = helper;
      ejs.renderFile(path.join('views/admin/reports/', "stock-template.ejs"), {extraVar: extraVar}, (err, data) => {
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
            pdf.create(data, options).toFile("public/reports/stock-report.pdf", function (err, data) {
                if (err) {
                    res.send(err);
                } else {
                  // fs.open('public/invoices/report.pdf', function (err, file) {
                  //   if (err) throw err;
                  //   console.log('Saved!');
                  // });
                    console.log(data);
                    res.redirect("/reports/stock-report.pdf");
                    // res.send("File created successfully");
                }
            });
        }
      });    
    } else if(req.query.submit === "xls"){
      let writeArr = [];
      let qty = 0;
      
      async.forEachOf(results.invoices, function (value, key, callback) {
        console.log(value.InvoiceItems)
        if(value.InvoiceItems && value.InvoiceItems.length != 0){
          let writeObj = {};
          qty = qty + value.InvoiceItems[0].quantity;
          writeObj["Invoice Number"] = value.invoice_no;
          writeObj["Invoice Date"] = value.date;
          writeObj["Name"] = value.Consignee.account_name;
          writeObj["GSTIN/UIN of Recipient"] = value.Consignee.gstin;
          writeObj["Invoice Value"] = value.net_amount;
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
      res.render('admin/'+viewDirectory+'/stock', { extraVar,helper, layout:'admin/layout/layout' });
    }
  })  
});

// router.get('/print', function(req, res, next) {
//   const file = reader.readFile('public/images/purchase-sample.xlsx');
//   let writeArr = [];
//   async.parallel({
//     purchases: function (callback) {
//       req.where = {};
//       if(req.query.from_date && req.query.to_date){

//         req.query.from_date = helper.changeDateFormate(req.query.from_date.trim(), "DD-MM-YYYY", "YYYY-MM-DD");
//         req.query.to_date = helper.changeDateFormate(req.query.to_date.trim(), "DD-MM-YYYY", "YYYY-MM-DD");
//         req.where = {
//           purchase_invoice_date: {
//             [Op.between]: [req.query.from_date, req.query.to_date],
//           }
//         };
//       }      
//       models.Purchase.getAllValues(req, function (data) {
//           callback(null, data);
//       });
//     },            
//   }, function (err, results) {

//     async.forEachOf(results.purchases, function (value, key, callback) {
//       // console.log("valuevalue", JSON.parse(JSON.stringify(value)), value.Account)
//       let writeObj = {};
//       writeObj["Invoice No."] = value.purchase_invoice_no;
//       writeObj["Date"] = value.purchase_invoice_date;
//       writeObj["Name"] = value.Account.account_name;
//       writeObj["GST In"] = value.Account.gstin;
//       writeObj["Total Value"] = value.total_value;
//       writeObj["IGST"] = value.igst_amount?parseFloat(value.igst_amount):"";
//       writeObj["CGST"] = value.cgst_amount?parseFloat(value.cgst_amount):"";
//       writeObj["SGST"] = value.sgst_amount?parseFloat(value.sgst_amount):"";
//       writeArr.push(writeObj);
//       callback();
//     }, function (err) {
//       if (err) {
//         console.error(err.message);
//       } else {
//         console.log("XXXXXXX", writeArr)
//         const ws = reader.utils.json_to_sheet(writeArr);

//         let wb = reader.utils.book_new();
//         reader.utils.book_append_sheet(wb, ws);
//         reader.writeFile(wb, "public/invoices/purchase-report.xlsx");
//         res.redirect("/invoices/purchase-report.xlsx");
//         // reader.utils.book_append_sheet(file,ws,"Sheet3");
//         // reader.writeFile(file,'public/invoices/purchase-report.xlsx')
//       }
//     });
    
//     // extraVar['results'] = results;
//     // res.render('admin/'+viewDirectory+'/accounts', { extraVar,helper, layout:'admin/layout/layout' });
//   })  
// });

// router.get('/accounts/:search', function(req, res, next) {
//   ImageUpload.uploadFile(req, res, function (err) {
//     req.body.from_date = helper.changeDateFormate(req.body.from_date.trim(), "DD-MM-YYYY", "YYYY-MM-DD");
//     req.body.to_date = helper.changeDateFormate(req.body.to_date.trim(), "DD-MM-YYYY", "YYYY-MM-DD");
    
//     async.parallel({
//       purchases: function (callback) {
//         req.where = {
//           purchase_invoice_date: {
//             [Op.between]: [req.body.from_date, req.body.to_date],
//           }
//         };
//         models.Purchase.getAllValues(req, function (data) {
//             callback(null, data);
//         });
//       },            
//     }, function (err, results) {
//       extraVar['results'] = results;
//       res.render('admin/'+viewDirectory+'/accounts', { extraVar,helper, layout:'admin/layout/layout' });
//     })
//   });  
// });


module.exports = router;
