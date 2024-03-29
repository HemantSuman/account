//translation module with dynamic json storage
var i18n_Validation = new (require('i18n-2'))({
  // setup some locales - other locales default to the first locale
  locales: ['en_valiation']
});
var moment = require('moment');
i18n_Validation.setLocale('en_valiation');

module.exports = function (sequelize, DataTypes) {
  var myModel = sequelize.define("Payment",
    {
        // purchase_id: {
        //     type: DataTypes.INTEGER,
        //     validate: {
        //         notEmpty: {
        //             msg: i18n_Validation.__('required')
        //         },   
        //     }
        // },
        account_id: {
            type: DataTypes.INTEGER,
            validate: {
                notEmpty: {
                    msg: i18n_Validation.__('required')
                },   
            }
        },
        company_id: {
            type: DataTypes.INTEGER,
            validate: {
                notEmpty: {
                    msg: i18n_Validation.__('required')
                },   
            }
        },
        pay_date: {
            type: DataTypes.DATEONLY,
            validate: {
                notEmpty: {
                    msg: i18n_Validation.__('required')
                },   
            }
        },
        paydate_string: {
            type: DataTypes.VIRTUAL,
            get() {
              return moment(`${this.pay_date}`).format("X");
            },
            // set(value) {
            //   throw new Error('Do not try to set the `fullName` value!');
            // }
        },
        pay_type: {
            type: DataTypes.VIRTUAL,
            get() {
              return 'Paid';
            },
        },
        pay_mode: {
            type: DataTypes.STRING,     
            validate: {
                notEmpty: {
                    msg: i18n_Validation.__('required')
                },   
            }       
        },
        pay_amount: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: i18n_Validation.__('required')
                },   
            }
        },
        remark: {
            type: DataTypes.STRING,
        },
    },
    {
      tableName: 'payments',
  });  
  myModel.getAllValues = function (req, res) {
    req.where.company_id = req.siteVariable.session.user.Company.id;
    var accountToPayment = myModel.belongsTo(sequelize.models.Account, {foreignKey: 'account_id'});
    this.findAll({where: req.where, 
        include: [
            accountToPayment
        ]
    })
        .then(function(results){
            res(results);
        })
    }    
    myModel.getFirstValues = function (req, res) {
        req.where.company_id = req.siteVariable.session.user.Company.id;
        this.findOne({where: req.where}).then(function (results) {
            res(results);
        });
    }
    myModel.getAllValuesPaging = function (req, res) {
        this.findAndCountAll({
            where: req.where,
            offset: req.offset,
            limit: req.limit,
            order: 'id DESC',
        }).then(function (results) {
            console.log(results);
            res(results);
        });
    }
    myModel.saveAllValues = function (req, res) {
        if(req.body.order === ''){
            req.body.order = 0;
        }
        this.create(req.body).then(function (results) {
            results.headerStatus = true;
            res(results);
        }).catch(function (err) {
            console.log(err);
            var errors = err;
            errors.headerStatus = false;
            res(errors);
        });
    }
    myModel.saveAllBulkValues = function (req, res) {
        this.bulkCreate(req).then(function (results) {
            results.headerStatus = true;
            res(results);
        }).catch(function (err) {
            console.log(err);
            var errors = err;
            errors.headerStatus = false;
            res(errors);
        });
    }
    myModel.updateAllValues = function (req, res) {
        if(req.body.order === ''){
            req.body.order = 0;
        }
        myModel.update(req.body, {where: {id: req.body.id}}).then(function (results) {
            results.headerStatus = true;
            res(results);
        }).catch(function (err) {
            console.log(err);
            var errors = err;
            errors.headerStatus = false;
            res(errors);
        });
    }
    myModel.deleteAllValues = function (req, res) {

        myModel.destroy({
            where: req.where
        }).then(function (results) {
            results.headerStatus = true;
            res(results);
        });
    }
    // myModel.getMenusForFront = function (req, res) {
    //     var menuToMenus = myModel.hasMany(myModel, {foreignKey: 'menu_id'});
    //     var menuToCategory = myModel.belongsTo(sequelize.models.Category, {foreignKey: 'category_id'});
    //     this.findAll({where: req.where,
    //             include: [
    //                 {association: menuToMenus, include: [menuToCategory]},
    //                 menuToCategory
    //             ],
    //             order : [req.orderBy]}
    //         )
    //         .then(function(results){
    //             res(results);
    //         })
    // }
    return myModel;
};