var models = require('../models');
function MyModelClass() {

    this.isLogin = function (req, res, next) {
        // if (req.isAuthenticated()) {
            next();
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