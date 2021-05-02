var express = require('express');
var router = express.Router();
var helper = require('../../helper');
var models = require('../../../models');
var ImageUpload = require('../../../middlewares/ImageUpload');
var async = require("async");
const reader = require('xlsx')
const { Op } = require('sequelize');
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
          console.log("XXXXXXX", writeArr)
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
      console.log("here", req.query, extraVar);
      res.render('admin/'+viewDirectory+'/accounts', { extraVar,helper, layout:'admin/layout/layout' });
    }
  })  
});

router.get('/gst2a', function(req, res, next) {
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
      let writeArr = [];
      async.forEachOf(results.invoices, function (value, key, callback) {
        let writeObj = {};
        writeObj["Invoice No."] = value.invoice_no;
        writeObj["Date"] = value.date;
        writeObj["Name"] = value.Consignee.account_name;
        writeObj["GST In"] = value.Consignee.gstin;
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
          console.log("XXXXXXX", writeArr)
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
      console.log("here", req.query, extraVar.results.invoices);
      res.render('admin/'+viewDirectory+'/gst2a', { extraVar,helper, layout:'admin/layout/layout' });
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
