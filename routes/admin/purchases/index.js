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
var moduleSlug = "purchases";
var PermissionModule = require('../../../middlewares/Permission');

var adminAuth = require('../../../middlewares/Auth');
router.use(adminAuth.isLogin);

router.use(function(req, res, next) {
  console.log("@@@@@@@@", req.siteVariable);
  extraVar['siteVariable'] = req.siteVariable;
  next();
});

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('admin/index', { helper, layout:'admin/layout/layout' });
// });

router.get('/', PermissionModule.Permission('view', moduleSlug,  extraVar), function(req, res, next) {
  req.where = {};

  models.Group.getAllValues(req, function (groups) {
    req.where = {};
    if(req.query.group_id != '' &&req.query.submit === "submit"){
      req.where = {'$Account.Group.id$': Number(req.query.group_id)}
    }
    models[modelName].getAllValues(req, function (results) {
      extraVar['groups'] = groups;

      if(req.query.group_id){
        req.query.group_id = req.query.group_id;
        extraVar['query'] = req.query;
      } else {
        extraVar['query'] = {};
      }
      res.render('admin/'+viewDirectory+'/index', {results, extraVar, helper, layout:'admin/layout/layout' });
    }); 
  });  
});

router.get('/add', PermissionModule.Permission('add', moduleSlug,  extraVar), function(req, res, next) {
  async.parallel({
    items: function (callback) {
        req.where = {}
        models.Item.getAllValues(req, function (data) {
            callback(null, data);
        });
    },    
    accounts: function (callback) {
        req.where = {'$Group.name$': 'Sundry Creditors'}
        models.Account.getAllValues(req, function (data) {
          console.log(data)
            callback(null, data);
        });
    },    
    taxes: function (callback) {
        req.where = {}
        models.Tax.getAllValues(req, function (data) {
            callback(null, data);
        });
    },    
    units: function (callback) {
        req.where = {}
        models.Unit.getAllValues(req, function (data) {
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
    // console.log("!!!!", req.body); return;
    let errors = [];
    let taxObj = {};
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
      },
      function (callback) {
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
        models.Tax.getAllValues(req, function (data1) {
          data1.map(function(v){
            taxObj[v.id] = v.percentage
          });
          callback();
        });        
      },
    ], function (err) {
      if (errors.length > 0) {
        res.status(400).send({status: false, msg: ' saved d failed', data: errors});
      } else {
        // console.log("@@@", taxObj);return;
        req.body.payment_remaining = req.body.total_value;
        req.body.company_id = extraVar.siteVariable.session.user.Company.id;
        models[modelName].saveAllValues(req, function (results) {

          async.parallel([
            function(callback) {
              if(results.id && req.body.tcs_check && req.body.tcs.length > 0){
                console.log("###", req.body.tcs_check, req.body.tcs.length)
                let bulkData1 = [];
                async.forEachOf(req.body.tcs, function (value1, key, callback1) {
                  if(typeof  value1 != "undefined"){

                    let tmpObj = {};
                    tmpObj.invoice_id = null;
                    tmpObj.purchase_id = results.id;
                    tmpObj.tax_id = value1;
                    tmpObj.percentage = taxObj[value1];
                    bulkData1.push(tmpObj);
                  }
                  callback1();
                }, function (err) {
                  console.log("&&", bulkData1)
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
                    value1.purchase_id = results.id;
                    value1.company_id = extraVar.siteVariable.session.user.Company.id;
                    bulkData1.push(value1);                  
                  }
                  callback1();
                }, function (err) {
                  if (err) {
                    console.error(err.message);
                    callback();
                  } else {
                    models.PurchaseItems.saveAllBulkValues(bulkData1, function (results){
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
                      let reqS1 = Object.assign({}, req);
                      reqS1.where = {sub_item_id: value1.sub_item_id, type: "purchase"}
                      models.Stock.getFirstValues(reqS1, function (data1) {

                        if(data1){
                          console.log("sub exist");
                          let stockDataUpdate = {};
                          stockDataUpdate.body = {
                            id: data1.id,
                            item_id: value1.item_id,
                            type: "purchase",
                            sub_item_id: value1.sub_item_id,
                            quantity: parseFloat(value1.quantity) + parseFloat(data1.quantity),
                            // no_of_pkg: parseFloat(value1.no_of_pkg) + parseFloat(data1.no_of_pkg),
                            no_of_pkg: 0,
                          };
                          models.Stock.updateAllValues(stockDataUpdate, function (results) {
                            callback1();
                          });
                        } else {
                          console.log("sub Not");
                          let stockData = {}
                          stockData.body = {
                            item_id: value1.item_id,
                            type: "purchase",
                            sub_item_id: value1.sub_item_id !== "" ? value1.sub_item_id : null,
                            quantity: value1.quantity,
                            // no_of_pkg: value1.no_of_pkg,
                            no_of_pkg: 0,
                            company_id: extraVar.siteVariable.session.user.Company.id
                          };
                          models.Stock.saveAllValues(stockData, function (results){
                            callback1();
                          });
                        }
                        // callback(null, data);
                      });
                    } else {
                      let reqS = Object.assign({}, req);
                      console.log('value1value1', value1);
                      reqS.where = {item_id: value1.item_id, sub_item_id: null, type: "purchase"}
                      models.Stock.getFirstValues(reqS, function (data) {
                        if(data){
                          console.log('exist', data);
                          
                          let stockDataUpdate = {};
                          stockDataUpdate.body = {
                            id: data.id,
                            item_id: value1.item_id,
                            type: "purchase",
                            sub_item_id: value1.sub_item_id !== "" ? value1.sub_item_id : null,
                            quantity: parseFloat(value1.quantity) + parseFloat(data.quantity),
                            // no_of_pkg: parseFloat(value1.no_of_pkg) + parseFloat(data.no_of_pkg),
                            no_of_pkg: 0,
                          };
                          models.Stock.updateAllValues(stockDataUpdate, function (results) {
                            callback1();
                          });
                        } else {
                          console.log("Not");
                          let stockData = {};
                          stockData.body = {
                            item_id: value1.item_id,
                            type: "purchase",
                            sub_item_id: value1.sub_item_id !== "" ? value1.sub_item_id : null,
                            quantity: value1.quantity,
                            // no_of_pkg: value1.no_of_pkg,
                            no_of_pkg: 0,
                            company_id: extraVar.siteVariable.session.user.Company.id
                          };
                          models.Stock.saveAllValues(stockData, function (results){
                            callback1();
                          });
                        }
                        // callback(null, data);
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
            console.log("errerrerrerrerr", err)
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

router.get('/edit/:id', PermissionModule.Permission('edit', moduleSlug,  extraVar), function(req, res, next) {

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
        console.log("$$$$$$$", data)
          callback(null, data);
      });
    },    
    itemsSubItem: function (callback) {
      req.where = {}
      models.Item.getAllValues(req, function (data) {
        let itemsSubItem = {};
        data.map(function(v, i){
          itemsSubItem[v.id] = v.SubItems;
        })
        callback(null, itemsSubItem);
      });
    },    
    accounts: function (callback) {
        req.where = {}
        models.Account.getAllValues(req, function (data) {
            callback(null, data);
        });
    },    
    taxes: function (callback) {
        req.where = {}
        models.Tax.getAllValues(req, function (data) {
            callback(null, data);
        });
    },    
    units: function (callback) {
        req.where = {}
        models.Unit.getAllValues(req, function (data) {
            callback(null, data);
        });
    }, 
  }, function (err, results) {
      extraVar['results'] = results;
      extraVar['OtherTaxesIds'] = results.my_model.OtherTaxes.map(i => i.tax_id);
      console.log("####",results.itemsSubItem['67']);
      res.render('admin/' + viewDirectory + '/edit', {extraVar, layout: 'admin/layout/layout'});
  });
});

router.post('/edit', PermissionModule.Permission('edit', moduleSlug,  extraVar), function(req, res, next) {
  ImageUpload.uploadFile(req, res, function (err) {
    let modelBuild = models[modelName].build(req.body);
    // console.log("!!!!", req.body); return;
    let errors = [];
    let taxObj = {};
    let previousPurchaseItemValue = {};
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
      },
      function (callback) {
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
        models.Tax.getAllValues(req, function (data1) {
          data1.map(function(v){
            taxObj[v.id] = v.percentage
          });
          callback();
        });        
      },
      function (callback) {
        if (errors.length == 0) {
          let reqS1 = Object.assign({}, req);
          reqS1.where = {id: req.body.id};
          models[modelName].getAllValues(reqS1, function (data2) {
            data2[0].PurchaseItems.map(function(val2){
              if(val2.sub_item_id) {
                previousPurchaseItemValue[val2.sub_item_id] = val2.quantity;
              } else {
                previousPurchaseItemValue[val2.item_id] = val2.quantity;
              }
            });
            callback(null, errors);
          });
        } else {
          callback(null, errors);
        }        
      },
    ], function (err) {
      // console.log("#$", previousPurchaseItemValue);return;
      if (errors.length > 0) {
        res.status(400).send({status: false, msg: ' saved d failed', data: errors});
      } else {
        models[modelName].updateAllValues(req, function (results) {

          async.parallel([
            function(callback) {
              if(results.headerStatus && req.body.tcs_check && req.body.tcs.length > 0){
                console.log("###", req.body.tcs_check, req.body.tcs.length)

                req.where = {'purchase_id': req.body.id};
                models.OtherTax.deleteAllValues(req, function (data) {

                  let bulkData1 = [];
                  async.forEachOf(req.body.tcs, function (value1, key, callback1) {
                    if(typeof  value1 != "undefined"){

                      let tmpObj = {};
                      tmpObj.invoice_id = null;
                      tmpObj.purchase_id = req.body.id;
                      tmpObj.tax_id = value1;
                      tmpObj.percentage = taxObj[value1];
                      tmpObj.company_id = extraVar.siteVariable.session.user.Company.id;
                      bulkData1.push(tmpObj);                  
                    }
                    callback1();
                  }, function (err) {
                    console.log("&&", bulkData1)
                    if (err) {
                      console.error(err.message);
                      callback();
                    } else {
                      models.OtherTax.saveAllBulkValues(bulkData1, function (results){
                        callback();
                      });
                    }
                  });
                });
                
              } else {
                callback()
              }
            },
            function(callback) {
              if(results.headerStatus){
                let bulkData1 = [];
                async.forEachOf(req.body.item, function (value1, key, callback1) {
                  if(typeof  value1 != "undefined"){

                    if(value1.id) {
                      console.log("1111")
                      let tmpData = {}
                      tmpData.body = value1;
                      if(tmpData.body.sub_item_id === ""){
                        tmpData.body.sub_item_id = null;
                      }
                      models.PurchaseItems.updateAllValues(tmpData, function (results) {
                        callback1(null);
                      });
                    } else {
                      console.log("2222")
                      if(value1.sub_item_id === ""){
                        value1.sub_item_id = null;
                      }
                      value1.purchase_id = req.body.id;
                      value1.company_id = extraVar.siteVariable.session.user.Company.id;
                      bulkData1.push(value1); 
                      callback1();
                    }                                     
                  } else {
                    callback1();
                  }
                }, function (err) {
                  if (err) {
                    console.error(err.message);
                    callback();
                  } else {
                    models.PurchaseItems.saveAllBulkValues(bulkData1, function (results){
                      callback();
                    });
                  }
                });
              } else {
                callback({status: false})
              }
            },
            function(callback) {
              if(results.headerStatus){
                async.forEachOf(req.body.item, function (value1, key, callback1) {
                  if(typeof  value1 != "undefined"){

                    if(value1.sub_item_id && value1.sub_item_id != ""){
                      let reqS1 = Object.assign({}, req);
                      reqS1.where = {sub_item_id: value1.sub_item_id, type: "purchase"}
                      models.Stock.getFirstValues(reqS1, function (data1) {

                        if(data1){
                          console.log("sub exist", previousPurchaseItemValue[data1.sub_item_id]);
                          let stockDataUpdate = {};
                          if(previousPurchaseItemValue[data1.sub_item_id]){
                            console.log("sub exist22222222")
                            let tmpPre = parseInt(previousPurchaseItemValue[data1.sub_item_id]);
                            let tmpPost = parseFloat(value1.quantity);
                            let qty = 0;
                            
                            if(tmpPre > tmpPost){
                              qty = parseFloat(data1.quantity) - parseFloat(tmpPre - tmpPost);
                            } else if(tmpPre < tmpPost){
                              qty = parseFloat(data1.quantity) + parseFloat(tmpPost - tmpPre);
                            } else {
                              qty = parseFloat(data1.quantity);
                            }
                            stockDataUpdate.body = {
                              id: data1.id,
                              item_id: value1.item_id,
                              type: "purchase",
                              sub_item_id: value1.sub_item_id,
                              quantity: qty,
                              // no_of_pkg: parseFloat(value1.no_of_pkg) + parseFloat(data1.no_of_pkg),
                              no_of_pkg: 0,
                            };
                            console.log("sub exist22222222", stockDataUpdate)
                          } else {
                            stockDataUpdate.body = {
                              id: data1.id,
                              item_id: value1.item_id,
                              type: "purchase",
                              sub_item_id: value1.sub_item_id,
                              quantity: parseFloat(value1.quantity) + parseFloat(data1.quantity),
                              // no_of_pkg: parseFloat(value1.no_of_pkg) + parseFloat(data1.no_of_pkg),
                              no_of_pkg: 0,
                            };
                          }
                          console.log("sub exist3333", stockDataUpdate)
                          models.Stock.updateAllValues(stockDataUpdate, function (results) {
                            callback1();
                          });
                        } else {
                          console.log("sub Not");
                          let stockData = {}
                          stockData.body = {
                            item_id: value1.item_id,
                            type: "purchase",
                            sub_item_id: value1.sub_item_id !== "" ? value1.sub_item_id : null,
                            quantity: value1.quantity,
                            // no_of_pkg: value1.no_of_pkg,
                            no_of_pkg: 0,
                            company_id: extraVar.siteVariable.session.user.Company.id
                          };
                          models.Stock.saveAllValues(stockData, function (results){
                            callback1();
                          });
                        }
                        // callback(null, data);
                      });
                    } else {
                      let reqS = Object.assign({}, req);
                      console.log('value1value1', value1);
                      reqS.where = {item_id: value1.item_id, sub_item_id: null, type: "purchase"}
                      models.Stock.getFirstValues(reqS, function (data) {
                        if(data){
                          console.log('exist',previousPurchaseItemValue, data.item_id);
                          let stockDataUpdate = {};
                          if(previousPurchaseItemValue[data.item_id]){
                            console.log("&&&1");
                            let tmpPre = parseInt(previousPurchaseItemValue[data.item_id]);
                            let tmpPost = parseFloat(value1.quantity);
                            let qty = 0;
                            console.log("&&&1", tmpPre , tmpPost);
                            if(tmpPre > tmpPost){
                              qty = parseFloat(data.quantity) - parseFloat(tmpPre - tmpPost);
                            } else if(tmpPre < tmpPost){
                              qty = parseFloat(data.quantity) + parseFloat(tmpPost - tmpPre);
                            } else {
                              qty = parseFloat(data.quantity);
                            }

                            stockDataUpdate.body = {
                              id: data.id,
                              item_id: value1.item_id,
                              type: "purchase",
                              sub_item_id: value1.sub_item_id !== "" ? value1.sub_item_id : null,
                              quantity: qty,
                              // no_of_pkg: parseFloat(value1.no_of_pkg) + parseFloat(data.no_of_pkg),
                              no_of_pkg: 0,
                            };
                            console.log('exist', stockDataUpdate);
                          } else {
                            console.log("&&&2");
                            
                            stockDataUpdate.body = {
                              id: data.id,
                              item_id: value1.item_id,
                              type: "purchase",
                              sub_item_id: value1.sub_item_id !== "" ? value1.sub_item_id : null,
                              quantity: parseFloat(value1.quantity) + parseFloat(data.quantity),
                              // no_of_pkg: parseFloat(value1.no_of_pkg) + parseFloat(data.no_of_pkg),
                              no_of_pkg: 0,
                            };
                          }
                          console.log("########", stockDataUpdate)
                          models.Stock.updateAllValues(stockDataUpdate, function (results) {
                            callback1();
                          });
                        } else {
                          console.log("Not");
                          let stockData = {};
                          stockData.body = {
                            item_id: value1.item_id,
                            type: "purchase",
                            sub_item_id: value1.sub_item_id !== "" ? value1.sub_item_id : null,
                            quantity: value1.quantity,
                            // no_of_pkg: value1.no_of_pkg,
                            no_of_pkg: 0,
                            company_id: extraVar.siteVariable.session.user.Company.id
                          };
                          models.Stock.saveAllValues(stockData, function (results){
                            callback1();
                          });
                        }
                        // callback(null, data);
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
            console.log("errerrerrerrerr", err)
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
