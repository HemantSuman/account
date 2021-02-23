var express = require('express');
var router = express.Router();
var helper = require('../helper');
var models = require('../../models');
var modelName = 'User';
var adminAuth = require('../../middlewares/Auth');
// router.use(adminAuth.isLogin);

router.use(function(req, res, next) {
  req.siteVariable = {"title":'Here is the title .......'};
  console.log('models!!!!!!!!!!!!!!', req.isAuthenticated(), req.user, req.session)
  // req.where = {};
  // models[modelName].getAllValues(req, function (results) {

  //   if (!results) {
  //       // res.status(200).send({status: false, message: 'Invalid OTP'});
  //   } else {
  //     console.log('results', results)
  //     // res.status(200).send({status: true});
  //   }
  // });  
  next();
});

/* GET home page. */
// router.get('/', function(req, res, next) {
//   console.log('%$%$')
//   res.render('admin/index', { helper, layout:'admin/layout/layout' });
// });
// router.get('/category/add', function(req, res, next) {
//   console.log('OOOOO')
//   res.render('admin/categories/add', { helper, layout:'admin/layout/layout' });
// });

module.exports = router;
