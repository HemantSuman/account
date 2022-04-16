//translation module with dynamic json storage
var i18n_Validation = new (require('i18n-2'))({
  // setup some locales - other locales default to the first locale
  locales: ['en_valiation']
});

i18n_Validation.setLocale('en_valiation');

module.exports = function (sequelize, DataTypes) {
  var myModel = sequelize.define("InvoiceItem",
    {
        type: {
            type: DataTypes.STRING,  
        },
        invoice_id: {
            type: DataTypes.INTEGER,  
            validate: {
                notEmpty: {
                    msg: i18n_Validation.__('required')
                },   
            }          
        },
        item_id: {
            type: DataTypes.INTEGER,  
            validate: {
                notEmpty: {
                    msg: i18n_Validation.__('required')
                },   
            }          
        },
        sub_item_id: {
            type: DataTypes.INTEGER,  
        },
        company_id: {
            type: DataTypes.INTEGER,
            validate: {
                notEmpty: {
                    msg: i18n_Validation.__('required')
                },   
            }
        },
        description: {
            type: DataTypes.STRING,
            // validate: {
            //     notEmpty: {
            //         msg: i18n_Validation.__('required')
            //     },   
            // }
        },
        // no_of_pkg: {
        //     type: DataTypes.STRING,
        //     validate: {
        //         notEmpty: {
        //             msg: i18n_Validation.__('required')
        //         },   
        //     }
        // },
        unit: {
            type: DataTypes.INTEGER,
            validate: {
                notEmpty: {
                    msg: i18n_Validation.__('required')
                },   
            }
        },
        quantity: {
            type: DataTypes.INTEGER,
            validate: {
                notEmpty: {
                    msg: i18n_Validation.__('required')
                },   
            }
        },
        rate: {
            type: DataTypes.INTEGER,
            validate: {
                notEmpty: {
                    msg: i18n_Validation.__('required')
                },   
            }
        },
        gst: {
            type: DataTypes.INTEGER,
            validate: {
                notEmpty: {
                    msg: i18n_Validation.__('required')
                },   
            }
        },
        gst_amount: {
            type: DataTypes.INTEGER,
            validate: {
                notEmpty: {
                    msg: i18n_Validation.__('required')
                },   
            }
        },
        amount: {
            type: DataTypes.INTEGER,
            validate: {
                notEmpty: {
                    msg: i18n_Validation.__('required')
                },   
            }
        }
    },
    {
      tableName: 'invoice_items',
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
    return myModel;
};