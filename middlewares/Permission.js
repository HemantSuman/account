var models = require('../models');
function MyModelClass() {

    this.Permission = function (action, moduleSlug, extraVar) {
        return function (req, res, next) {
            if(req.siteVariable.session.user.permissionModuleObj[moduleSlug] && req.siteVariable.session.user.permissionModuleObj[moduleSlug][action] == 1){
                next()
            } else {
                res.render('error', {extraVar, layout:'admin/layout/layout' });
            }
            // Implement the middleware function based on the options object
            
          }
        // console.log("innnnnnn", req.siteVariable.session.user.permissionModuleObj)
        // console.log("innnnnnn", moduleSlug);
        // if (req.isAuthenticated()) {
            // next();
        // } else {
            
        //     if (req.xhr) {
        //         res.status(400).send({status: false, msg: 'Please login first', data: []});
        //     } else {
        //         console.log("/")
        //         res.redirect('/admin/login');
        //     }

        // }
    }
}

module.exports = new MyModelClass();