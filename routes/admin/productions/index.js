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
var moduleSlug = "productions";
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

router.get('/add', PermissionModule.Permission('add', moduleSlug,  extraVar), function(req, res, next) {
  async.parallel({
    items: function (callback) {
        req.where = {category_id: 2}
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

router.post('/add', PermissionModule.Permission('add', moduleSlug,  extraVar), function(req, res, next) {
  ImageUpload.uploadFile(req, res, function (err) {
    
    let errors = [];
    let newSaveData = [];
    if(!req.body.sub_item_id){
      req.body.sub_item_id = null;
    }
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
        if(typeof req.body.items === "undefined"){
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
        async.forEachOf(req.body.items, function (value1, key, callback1) {
          let reqS1 = Object.assign({}, req);
          reqS1.where = {
          item_id: value1.item_id,
            [Op.and]: [
              models.sequelize.literal("cast(quantity as SIGNED) >= "+value1.quantity),
            ],
            // quantity: {
            //   [Op.gte]: value1.quantity
            // }
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
        req.body.company_id = extraVar.siteVariable.session.user.Company.id;
        models[modelName].saveAllValues(req, function (results) {

          async.parallel([

            function(callback) {
              if(results.id){
      
                if(req.body.sub_item_id && req.body.sub_item_id != ""){
                  let reqS1 = Object.assign({}, req);
                  reqS1.where = {sub_item_id: req.body.sub_item_id, type: "production"}
                  models.Stock.getFirstValues(reqS1, function (data1) {
      
                    if(data1){
                      console.log("sub exist");
                      let stockDataUpdate = {};
                      stockDataUpdate.body = {
                        id: data1.id,
                        quantity: parseFloat(data1.quantity) + parseFloat(req.body.quantity),
                        // no_of_pkg: parseFloat(data1.no_of_pkg) + parseFloat(req.body.no_of_pkg),
                        no_of_pkg: 0,
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
                        // no_of_pkg: req.body.no_of_pkg,
                        no_of_pkg: 0,
                        company_id: extraVar.siteVariable.session.user.Company.id
                      };
                      models.Stock.saveAllValues(stockData, function (results){
                        callback();
                      });
                    }
                  });
                } else {
                  let reqS = Object.assign({}, req);
                  console.log('value1value1', req.body);
                  reqS.where = {item_id: req.body.item_id, sub_item_id: null, type: "production"}
                  models.Stock.getFirstValues(reqS, function (data) {
                    if(data){
                      console.log('exist', data);
                      
                      let stockDataUpdate = {};
                      stockDataUpdate.body = {
                        id: data.id,
                        quantity: parseFloat(data.quantity) + parseFloat(req.body.quantity),
                        // no_of_pkg: parseFloat(data.no_of_pkg) + parseFloat(req.body.no_of_pkg),
                        no_of_pkg: 0,
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
                        // no_of_pkg: req.body.no_of_pkg,
                        no_of_pkg: 0,
                        company_id: extraVar.siteVariable.session.user.Company.id
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
                let reqS1 = Object.assign({}, req);
                reqS1.where = {
                  item_id: value1.item_id,
                  [Op.and]: [
                    models.sequelize.literal("cast(quantity as SIGNED) >= "+value1.quantity),
                  ],
                  // quantity: {
                  //   [Op.gte]: value1.quantity
                  // }
                }
                models.Stock.getFirstValues(reqS1, function (data1) {
                  if(data1){
                    let stockDataUpdate = {};
                    stockDataUpdate.body = {
                      id: data1.id,
                      quantity: parseFloat(data1.quantity) - parseFloat(value1.quantity),
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
