var express = require('express');
var router = express.Router();
var helper = require('../../helper');
var models = require('../../../models');
var ImageUpload = require('../../../middlewares/ImageUpload');
var async = require("async");
const { Op } = require('sequelize')

var extraVar = [];

var modelName = 'Production';
var viewDirectory = 'productions';
var titleName = 'Add New Production';

extraVar['modelName'] = modelName;
extraVar['viewDirectory'] = viewDirectory;
extraVar['titleName'] = titleName;

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
    brands: function (callback) {
        req.where = {}
        models.Brand.getAllValues(req, function (data) {
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
router.get('/add1', function(req, res, next) {
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
    brands: function (callback) {
        req.where = {}
        models.Brand.getAllValues(req, function (data) {
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
    res.render('admin/'+viewDirectory+'/add1', { extraVar,helper, layout:'admin/layout/layout' });
  })  
});

router.post('/add', function(req, res, next) {
  ImageUpload.uploadFile(req, res, function (err) {
    
    let errors = [];
    let newSaveData = [];
    req.body.date_of_production = helper.changeDateFormate(req.body.date_of_production.trim(), "DD-MM-YYYY", "YYYY-MM-DD");
    async.parallel([
      function (callback) {
        let modelBuild = models[modelName].build(req.body);
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
        async.forEachOf(req.body.items, function (value1, key, callback1) {
          let reqS1 = {};
          reqS1.where = {
            item_id: value1.item_id,
            quantity: {
              [Op.gte]: value1.quantity
            }
          }
          models.Stock.getFirstValues(reqS1, function (data1) {
            if(!data1){
              console.log('##', data1);
              errorsItem = {
                  message: 'Insufficient Stock!',
                  type: 'Validation error',
                  path: "quantity_"+ key,
                  value: '',
              };
              errors = errors.concat(errorsItem);
            }
            callback1();
          });

        }, function (err) {
            callback(null, errors);
        });  
      }      
    ], function (err) {
      console.log("errorss", errors);
      
      if (errors.length > 0) {
        res.status(400).send({status: false, msg: ' saved d failed', data: errors});
      } else {
        models[modelName].saveAllValues(req, function (results) {

          async.parallel([

            function(callback) {
              if(results.id){
      
                if(req.body.sub_item_id && req.body.sub_item_id != ""){
                  let reqS1 = {};
                  reqS1.where = {sub_item_id: req.body.sub_item_id}
                  models.Stock.getFirstValues(reqS1, function (data1) {
      
                    if(data1){
                      console.log("sub exist");
                      let stockDataUpdate = {};
                      stockDataUpdate.body = {
                        id: data1.id,
                        quantity: parseInt(data1.quantity) + parseInt(req.body.quantity),
                      };
                      models.Stock.updateAllValues(stockDataUpdate, function (results) {
                        callback();
                      });
                    } else {
                      console.log("sub Not");
                      let stockData = {}
                      stockData.body = {
                        item_id: req.body.item_id,
                        type: "production",
                        sub_item_id: req.body.sub_item_id !== "" ? req.body.sub_item_id : null,
                        quantity: req.body.quantity,
                      };
                      models.Stock.saveAllValues(stockData, function (results){
                        callback();
                      });
                    }
                  });
                } else {
                  let reqS = {};
                  console.log('value1value1', req.body);
                  reqS.where = {item_id: req.body.item_id, sub_item_id: null}
                  models.Stock.getFirstValues(reqS, function (data) {
                    if(data){
                      console.log('exist', data);
                      
                      let stockDataUpdate = {};
                      stockDataUpdate.body = {
                        id: data.id,
                        quantity: parseInt(data.quantity) + parseInt(req.body.quantity),
                      };
                      models.Stock.updateAllValues(stockDataUpdate, function (results) {
                        callback();
                      });
                    } else {
                      console.log("Not");
                      let stockData = {};
                      stockData.body = {
                        item_id: req.body.item_id,
                        type: "production",
                        sub_item_id: req.body.sub_item_id !== "" ? req.body.sub_item_id : null,
                        quantity: req.body.quantity,
                      };
                      models.Stock.saveAllValues(stockData, function (results){
                        callback();
                      });
                    }
                  });
                }
              } else {
                callback({status: false})
              }
            },
            function(callback) {

              async.forEachOf(req.body.items, function (value1, key, callback1) {
                let reqS1 = {};
                reqS1.where = {
                  item_id: value1.item_id,
                  quantity: {
                    [Op.gte]: value1.quantity
                  }
                }
                models.Stock.getFirstValues(reqS1, function (data1) {
                  if(data1){
                    let stockDataUpdate = {};
                    stockDataUpdate.body = {
                      id: data1.id,
                      quantity: parseInt(data1.quantity) - parseInt(value1.quantity),
                    };
                    models.Stock.updateAllValues(stockDataUpdate, function (results) {
                      callback1();
                    });
                  } else {
                    callback1();
                  }
                });
              }, function (err) {
                  callback(null, errors);
              });              
            }
          ],
          function(err, results) {
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

router.post('/add1', function(req, res, next) {
  ImageUpload.uploadFile(req, res, function (err) {
    
    let errors = [];
    let newSaveData = [];
    // if(req.body.status && req.body.status === 'on'){
    //   req.body.status = 1;
    // } else {
    //   req.body.status = 0;
    // }
    req.body.date_of_production = helper.changeDateFormate(req.body.date_of_production.trim(), "DD-MM-YYYY", "YYYY-MM-DD");
    async.parallel([
      function (callback) {
        let temData = {}
        temData["brand_id"] = req.body.brand_id;
        temData["date_of_production"] = req.body.date_of_production;
        let modelBuild = models[modelName].build(temData);
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
        async.forEachOf(req.body.item, function (value1, key, callback1) {
          if(typeof  value1 != "undefined"){

            value1["brand_id"] = req.body.brand_id;
            value1["date_of_production"] = req.body.date_of_production;
            if(value1.sub_item_id === ""){
              value1.sub_item_id = null;
            }
            newSaveData.push(value1);
            var modelBuild = models[modelName].build(value1);

            modelBuild.validate()
            .then(function (err) {
                callback(null, errors);              
            })
            .catch(function (err){
              console.log("errorss1", err);
              if (err != null) {
                  async.forEachOf(err.errors, function (errObj, callback2) {
                    if(!["brand_id", "date_of_production"].includes(errObj.path)){
                      errObj.path = "item"+"_"+errObj.path+"_" + key;
                    }
                    console.log("###", errors, errObj);
                    errors = errors.concat(errObj);
                  });
                  callback2();
              } else {
                callback1();
              }
            });
          }
        }, function (err) {
            callback(null, errors);
        });  
      }      
    ], function (err) {
      console.log("errorss", errors);
      if (errors.length > 0) {
        res.status(400).send({status: false, msg: ' saved d failed', data: errors});
      } else {
        models[modelName].saveAllBulkValues(newSaveData, function (results) {

          async.parallel([
            function(callback) {
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
              }, function (err) {
                if (err) {
                  callback();
                  console.error(err.message);
                } else {
                  callback();
                }
              });
            }
          ],
          function(err, results) {
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

          // if(results.headerStatus){
          //   req.session.sessionFlash = {
          //     type: 'success',
          //     message: 'New record created successfully!'
          //   }
          //   res.status(200).send({status: true, url: '/admin/' + viewDirectory});
          // } else {
          //   req.session.sessionFlash = {
          //     type: 'error',
          //     message: 'errorrr ............'
          //   }
          //   res.status(200).send({status: false, url: '/admin/' + viewDirectory});
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
