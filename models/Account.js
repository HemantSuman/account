//translation module with dynamic json storage
var i18n_Validation = new (require('i18n-2'))({
  // setup some locales - other locales default to the first locale
  locales: ['en_valiation']
});

i18n_Validation.setLocale('en_valiation');

module.exports = function (sequelize, DataTypes) {
  var myModel = sequelize.define("Account",
    {
        group_id: {
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
        code: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: i18n_Validation.__('required')
                },   
            }
        },
        account_name: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: i18n_Validation.__('required')
                },   
            }
        },
        address: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: i18n_Validation.__('required')
                },   
            }
        },
        state_id: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: i18n_Validation.__('required')
                },   
            }
        },
        city: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: i18n_Validation.__('required')
                },   
            }
        },
        pin: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: i18n_Validation.__('required')
                },   
            }
        },
        gstin: {
            type: DataTypes.STRING,
            // validate: {
            //     notEmpty: {
            //         msg: i18n_Validation.__('required')
            //     },   
            // }
        },
        email: {
            type: DataTypes.STRING,           
        },
        mobile1: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: i18n_Validation.__('required')
                },   
            }
        },
        mobile2: {
            type: DataTypes.STRING,
        },
        bank_name: {
            type: DataTypes.STRING,
        },
        ac_no: {
            type: DataTypes.STRING,
        },
        ifsc: {
            type: DataTypes.STRING,
        },
        pan_no: {
            type: DataTypes.STRING,
        },
        registration_no: {
            type: DataTypes.STRING,
        },
        status: {
            type: DataTypes.STRING,
        },
    },
    {
      tableName: 'accounts',
  });  
    myModel.getAllValues = function (req, res) {
        req.where.company_id = req.siteVariable.session.user.Company.id;
        this.findAll({where: req.where})
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