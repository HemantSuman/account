var express = require('express');
var router = express.Router();
var helper = require('../../helper');
var models = require('../../../models');
var ImageUpload = require('../../../middlewares/ImageUpload');
var async = require("async");
const { Op } = require('sequelize');
const { relativeTimeRounding } = require('moment');
var fs = require('fs');
var pdf = require('html-pdf');
var ejs = require('ejs');
let path = require("path");
var extraVar = [];

var modelName = 'Invoice';
var viewDirectory = 'invoices';
var titleName = 'Add new invoice';

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
    units: function (callback) {
        req.where = {}
        models.Unit.getAllValues(req, function (data) {
            callback(null, data);
        });
    },
    taxes: function (callback) {
        req.where = {}
        models.Tax.getAllValues(req, function (data) {
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
    req.body.date = helper.changeDateFormate(req.body.date.trim(), "DD-MM-YYYY", "YYYY-MM-DD");
    req.body.challan_date = helper.changeDateFormate(req.body.challan_date.trim(), "DD-MM-YYYY", "YYYY-MM-DD");
    req.body.order_date = helper.changeDateFormate(req.body.order_date.trim(), "DD-MM-YYYY", "YYYY-MM-DD");
    req.body.rr_date = helper.changeDateFormate(req.body.rr_date.trim(), "DD-MM-YYYY", "YYYY-MM-DD");
    console.log(req.body);
    var modelBuild = models[modelName].build(req.body);
    var errors = [];
    let taxObj = {};
    async.parallel([
      function (callback) {
        console.log("111");
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
        console.log("222");
        if(typeof req.body.item === "undefined"){
          errorsItem = 
            {
              message: 'Atleast one item is required!',
              type: 'Validation error',
              path: 'items',
              value: '',
          };
          errors = errors.concat(errorsItem);
        }
        callback(null, errors);
      },
      function (callback) {
        console.log("333");
        if(req.body.item && req.body.item.length > 0 ){
          async.forEach(req.body.item, function (value1, callback1) {

            let itemInvoiceBuild = models['InvoiceItem'].build(value1);
            itemInvoiceBuild.validate()
            .then(function(){
              callback1(null);
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
          })
        } else {
          callback();
        }
      },
      function (callback) {
        console.log("4444");
        async.forEachOf(req.body.item, function (value1, key, callback1) {
          if(typeof  value1 != "undefined"){

            if(value1.sub_item_id === ""){
              value1.sub_item_id = null;
            }

            let reqS1 = {};
            reqS1.where = {
              item_id: value1.item_id,
              sub_item_id: value1.sub_item_id,
              quantity: {
                [Op.gte]: value1.quantity
              }
            }
            models.Stock.getFirstValues(reqS1, function (data1) {
              if(!data1){
                console.log('##', data1, key);
                errorsItem = {
                    message: 'Insufficient Stock!',
                    type: 'Validation error',
                    path: "item_quantity_"+ key,
                    value: '',
                };
                errors = errors.concat(errorsItem);                
              }
              callback1();
            });
          } else {
            callback1();
          }

        }, function (err) {
            callback(null, errors);
        });  
      },
      function (callback) {
        models.Tax.getAllValues(req, function (data1) {
          data1.map(function(v){
            taxObj[v.id] = v.percentage
          });
          callback();
        });        
      },
    ], function (err) {
      if (errors.length > 0) {
        res.status(400).send({status: false, msg: ' saved failed', data: errors});
      } else {      
        models[modelName].saveAllValues(req, function (results) {

          async.parallel([
            function(callback) {
              if(results.id && req.body.tcs_check && req.body.tcs.length > 0){
                let bulkData1 = [];
                async.forEachOf(req.body.tcs, function (value1, key, callback1) {
                  if(typeof  value1 != "undefined"){
                    let tmpObj = {};
                    tmpObj.invoice_id = results.id;
                    tmpObj.purchase_id = null;
                    tmpObj.tax_id = value1;
                    tmpObj.percentage = taxObj[value1];
                    bulkData1.push(tmpObj);                  
                  }
                  callback1();
                }, function (err) {
                  if (err) {
                    console.error(err.message);
                    callback();
                  } else {
                    models.OtherTax.saveAllBulkValues(bulkData1, function (results){
                      callback();
                    });
                  }
                });
              } else {
                callback()
              }
            },
            function(callback) {
              if(results.id){
                let bulkData1 = [];
                async.forEachOf(req.body.item, function (value1, key, callback1) {
                  if(typeof  value1 != "undefined"){

                    if(value1.sub_item_id === ""){
                      value1.sub_item_id = null;
                    }
                    value1.invoice_id = results.id;
                    bulkData1.push(value1);                  
                  }
                  callback1();
                }, function (err) {
                  if (err) {
                    console.error(err.message);
                    callback();
                  } else {
                    models.InvoiceItem.saveAllBulkValues(bulkData1, function (results){
                      callback();
                    });
                  }
                });
              } else {
                callback({status: false})
              }
            },
            function(callback) {
              if(results.id){
                async.forEachOf(req.body.item, function (value1, key, callback1) {
                  if(typeof  value1 != "undefined"){

                    if(value1.sub_item_id && value1.sub_item_id != ""){
                      let reqS1 = {};
                      reqS1.where = {sub_item_id: value1.sub_item_id}
                      models.Stock.getFirstValues(reqS1, function (data1) {

                        if(data1){
                          console.log("sub exist");
                          let stockDataUpdate = {};
                          stockDataUpdate.body = {
                            id: data1.id,
                            quantity: parseInt(data1.quantity) - parseInt(value1.quantity),
                            no_of_pkg: parseInt(data1.no_of_pkg) - parseInt(value1.no_of_pkg),
                          };
                          models.Stock.updateAllValues(stockDataUpdate, function (results) {
                            callback1();
                          });
                        } else {
                          callback1();
                        }
                        // callback(null, data);
                      });
                    } else {
                      let reqS = {};
                      console.log('value1value1', value1);
                      reqS.where = {item_id: value1.item_id, sub_item_id: null}
                      models.Stock.getFirstValues(reqS, function (data) {
                        if(data){
                          console.log('exist', data);
                          
                          let stockDataUpdate = {};
                          stockDataUpdate.body = {
                            id: data.id,
                            quantity: parseInt(data.quantity) - parseInt(value1.quantity),
                            no_of_pkg: parseInt(data.no_of_pkg) - parseInt(value1.no_of_pkg),
                          };
                          models.Stock.updateAllValues(stockDataUpdate, function (results) {
                            callback1();
                          });
                        } else {
                          callback1();
                        }
                      });
                    }
                  } else {
                    callback1();
                  }
                  // callback(null);
                }, function (err) {
                  if (err) {
                    callback();
                    console.error(err.message);
                  } else {
                    callback();
                  }
                });                              
              } else {
                callback({status: false})
              }
            }
          ],
          function(err, results) {
            // console.log('111111111'); return;
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


          // if(results.headerStatus) {
          //   req.session.sessionFlash = {
          //     type: 'success',
          //     message: 'New record created successfully!'
          //   }
          //   res.status(200).send({status: true, url: '/admin/' + viewDirectory});
          // } else {
          //   req.session.sessionFlash = {
          //     type: 'success',
          //     message: 'errorrr ............'
          //   }
          //   res.status(200).send({status: true, url: '/admin/' + viewDirectory});
          // }
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
    units: function (callback) {
        req.where = {}
        models.Unit.getAllValues(req, function (data) {
            callback(null, data);
        });
    },
    taxes: function (callback) {
        req.where = {}
        models.Tax.getAllValues(req, function (data) {
            callback(null, data);
        });
    },
  }, function (err, results) {
      extraVar['results'] = results;
      console.log(results.my_model.InvoiceItems);
      res.render('admin/' + viewDirectory + '/edit', {extraVar, layout: 'admin/layout/layout'});
  });
});

router.post('/edit', function(req, res, next) {
  ImageUpload.uploadFile(req, res, function (err) {
    req.body.date = helper.changeDateFormate(req.body.date.trim(), "DD-MM-YYYY", "YYYY-MM-DD");
    req.body.challan_date = helper.changeDateFormate(req.body.challan_date.trim(), "DD-MM-YYYY", "YYYY-MM-DD");
    req.body.order_date = helper.changeDateFormate(req.body.order_date.trim(), "DD-MM-YYYY", "YYYY-MM-DD");
    req.body.rr_date = helper.changeDateFormate(req.body.rr_date.trim(), "DD-MM-YYYY", "YYYY-MM-DD");
    console.log(req.body);
    var modelBuild = models[modelName].build(req.body);
    var errors = [];
    let taxObj = {};
    async.parallel([
      function (callback) {
        console.log("111");
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
        console.log("222");
        if(typeof req.body.item === "undefined"){
          errorsItem = 
            {
              message: 'Atleast one item is required!',
              type: 'Validation error',
              path: 'items',
              value: '',
          };
          errors = errors.concat(errorsItem);
        }
        callback(null, errors);
      },
      function (callback) {
        console.log("333");
        if(req.body.item && req.body.item.length > 0 ){
          async.forEach(req.body.item, function (value1, callback1) {

            let itemInvoiceBuild = models['InvoiceItem'].build(value1);
            itemInvoiceBuild.validate()
            .then(function(){
              callback1(null);
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
          })
        } else {
          callback();
        }
      },
      function (callback) {
        console.log("4444");
        async.forEachOf(req.body.item, function (value1, key, callback1) {
          if(typeof  value1 != "undefined"){

            if(value1.sub_item_id === ""){
              value1.sub_item_id = null;
            }

            let reqS1 = {};
            reqS1.where = {
              item_id: value1.item_id,
              sub_item_id: value1.sub_item_id,
              quantity: {
                [Op.gte]: value1.quantity
              }
            }
            models.Stock.getFirstValues(reqS1, function (data1) {
              if(!data1){
                console.log('##', data1, key);
                errorsItem = {
                    message: 'Insufficient Stock!',
                    type: 'Validation error',
                    path: "item_quantity_"+ key,
                    value: '',
                };
                errors = errors.concat(errorsItem);                
              }
              callback1();
            });
          } else {
            callback1();
          }

        }, function (err) {
            callback(null, errors);
        });  
      },
      function (callback) {
        models.Tax.getAllValues(req, function (data1) {
          data1.map(function(v){
            taxObj[v.id] = v.percentage
          });
          callback();
        });        
      },
    ], function (err) {
      if (errors.length > 0) {
        res.status(400).send({status: false, msg: ' saved failed', data: errors});
      } else {      
        models[modelName].updateAllValues(req, function (results) {

          async.parallel([
            function(callback) {
              if(results.id && req.body.tcs_check && req.body.tcs.length > 0){
                let bulkData1 = [];
                async.forEachOf(req.body.tcs, function (value1, key, callback1) {
                  if(typeof  value1 != "undefined"){
                    let tmpObj = {};
                    tmpObj.invoice_id = results.id;
                    tmpObj.purchase_id = null;
                    tmpObj.tax_id = value1;
                    tmpObj.percentage = taxObj[value1];
                    bulkData1.push(tmpObj);                  
                  }
                  callback1();
                }, function (err) {
                  if (err) {
                    console.error(err.message);
                    callback();
                  } else {
                    models.OtherTax.saveAllBulkValues(bulkData1, function (results){
                      callback();
                    });
                  }
                });
              } else {
                callback()
              }
            },
            function(callback) {
              if(results.id){
                let bulkData1 = [];
                async.forEachOf(req.body.item, function (value1, key, callback1) {
                  if(typeof  value1 != "undefined"){

                    if(value1.sub_item_id === ""){
                      value1.sub_item_id = null;
                    }
                    value1.invoice_id = results.id;
                    bulkData1.push(value1);                  
                  }
                  callback1();
                }, function (err) {
                  if (err) {
                    console.error(err.message);
                    callback();
                  } else {
                    models.InvoiceItem.saveAllBulkValues(bulkData1, function (results){
                      callback();
                    });
                  }
                });
              } else {
                callback({status: false})
              }
            },
            function(callback) {
              if(results.id){
                async.forEachOf(req.body.item, function (value1, key, callback1) {
                  if(typeof  value1 != "undefined"){

                    if(value1.sub_item_id && value1.sub_item_id != ""){
                      let reqS1 = {};
                      reqS1.where = {sub_item_id: value1.sub_item_id}
                      models.Stock.getFirstValues(reqS1, function (data1) {

                        if(data1){
                          console.log("sub exist");
                          let stockDataUpdate = {};
                          stockDataUpdate.body = {
                            id: data1.id,
                            quantity: parseInt(data1.quantity) - parseInt(value1.quantity),
                            no_of_pkg: parseInt(data1.no_of_pkg) - parseInt(value1.no_of_pkg),
                          };
                          models.Stock.updateAllValues(stockDataUpdate, function (results) {
                            callback1();
                          });
                        } else {
                          callback1();
                        }
                        // callback(null, data);
                      });
                    } else {
                      let reqS = {};
                      console.log('value1value1', value1);
                      reqS.where = {item_id: value1.item_id, sub_item_id: null}
                      models.Stock.getFirstValues(reqS, function (data) {
                        if(data){
                          console.log('exist', data);
                          
                          let stockDataUpdate = {};
                          stockDataUpdate.body = {
                            id: data.id,
                            quantity: parseInt(data.quantity) - parseInt(value1.quantity),
                            no_of_pkg: parseInt(data.no_of_pkg) - parseInt(value1.no_of_pkg),
                          };
                          models.Stock.updateAllValues(stockDataUpdate, function (results) {
                            callback1();
                          });
                        } else {
                          callback1();
                        }
                      });
                    }
                  } else {
                    callback1();
                  }
                  // callback(null);
                }, function (err) {
                  if (err) {
                    callback();
                    console.error(err.message);
                  } else {
                    callback();
                  }
                });                              
              } else {
                callback({status: false})
              }
            }
          ],
          function(err, results) {
            // console.log('111111111'); return;
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


          // if(results.headerStatus) {
          //   req.session.sessionFlash = {
          //     type: 'success',
          //     message: 'New record created successfully!'
          //   }
          //   res.status(200).send({status: true, url: '/admin/' + viewDirectory});
          // } else {
          //   req.session.sessionFlash = {
          //     type: 'success',
          //     message: 'errorrr ............'
          //   }
          //   res.status(200).send({status: true, url: '/admin/' + viewDirectory});
          // }
        });
      }
    })
  });
});

router.get('/print/:id', function(req, res, next) {

  var id = req.params.id;
  async.parallel({
    my_model: function (callback) {
        req.where = {'id': id}
        models[modelName].getFirstValues(req, function (data) {
            callback(null, data);
        });
    },
    taxKeyValue: function (callback) {
      req.where = {}
      models.Tax.getAllValues(req, function (data) {
        let taxKeyValue = {};
        data.map(function(data) {
          taxKeyValue[data.id] = data.name;
        });
          callback(null, taxKeyValue);
      });
    },
    accountKeyValue: function (callback) {
      req.where = {}
      models.Account.getAllValues(req, function (data) {
        let accountKeyValue = {};
        data.map(function(data) {
          // accountKeyValue[data.id] = [];
          accountKeyValue[data.id] = data;
        });
          callback(null, accountKeyValue);
      });
    },
  }, function (err, results) {
      extraVar['results'] = results;
      console.log("####",extraVar.results);
      // console.log("##", __dirname)
      ejs.renderFile(path.join('views/admin/invoices/', "invoice-template.ejs"), {extraVar: extraVar}, (err, data) => {
        console.log(err)
        if (err) {
              res.send(err);
        } else {
            let options = {
              "format": "A4", 
              // "orientation": "portrait",
              // "height": "11.25in",
              // "width": "8.5in",
              // "header": {
              //     "height": "20mm"
              // },
              // "footer": {
              //     "height": "20mm",
              // },
            };
            pdf.create(data, options).toFile("public/invoices/report.pdf", function (err, data) {
                if (err) {
                    res.send(err);
                } else {
                  // fs.open('public/invoices/report.pdf', function (err, file) {
                  //   if (err) throw err;
                  //   console.log('Saved!');
                  // });
                    console.log(data);
                    res.redirect("/invoices/report.pdf");
                    // res.send("File created successfully");
                }
            });
        }
      });
      // res.render('admin/' + viewDirectory + '/edit', {extraVar, layout: 'admin/layout/layout'});
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
