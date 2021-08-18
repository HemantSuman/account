//translation module with dynamic json storage
var i18n_Validation = new (require('i18n-2'))({
  // setup some locales - other locales default to the first locale
  locales: ['en_valiation']
});
var moment = require('moment');

i18n_Validation.setLocale('en_valiation');

module.exports = function (sequelize, DataTypes) {
  var myModel = sequelize.define("Purchase",
    {
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
        purchase_invoice_no: {
            type: DataTypes.STRING,  
            validate: {
                notEmpty: {
                    msg: i18n_Validation.__('required')
                },   
            }          
        },
        purchase_invoice_date: {
            type: DataTypes.DATE,
            get() {
                if(this.getDataValue('purchase_invoice_date') && typeof this.getDataValue('purchase_invoice_date') !== "undefined"){
                    return moment(this.getDataValue('purchase_invoice_date'), "YYYY-MM-DD").format("DD-MM-YYYY");
                }
                return null;
            },
            validate: {
                notEmpty: {
                    msg: i18n_Validation.__('required')
                },   
            }
        },
        frieght_type: {
            type: DataTypes.STRING,
            // validate: {
            //     notEmpty: {
            //         msg: i18n_Validation.__('required')
            //     },   
            // }
        },
        mode_of_transport: {
            type: DataTypes.STRING,
            // validate: {
            //     notEmpty: {
            //         msg: i18n_Validation.__('required')
            //     },   
            // }
        },
        vehicle_no: {
            type: DataTypes.STRING,
            // validate: {
            //     notEmpty: {
            //         msg: i18n_Validation.__('required')
            //     },   
            // }
        },
        dispatched_through: {
            type: DataTypes.STRING,
            // validate: {
            //     notEmpty: {
            //         msg: i18n_Validation.__('required')
            //     },   
            // }
        },
        term_of_payment: {
            type: DataTypes.STRING,
            // validate: {
            //     notEmpty: {
            //         msg: i18n_Validation.__('required')
            //     },   
            // }
        },
        to_be_pay_upto_date: {
            type: DataTypes.DATE,
            validate: {
                notEmpty: {
                    msg: i18n_Validation.__('required')
                },   
            }
        },
        // pay_date: {
        //     type: DataTypes.DATE,
        //     validate: {
        //         notEmpty: {
        //             msg: i18n_Validation.__('required')
        //         },   
        //     }
        // },
        // pay_amount: {
        //     type: DataTypes.STRING,
        //     validate: {
        //         notEmpty: {
        //             msg: i18n_Validation.__('required')
        //         },   
        //     }
        // },
        // pay_mode: {
        //     type: DataTypes.STRING,
        //     validate: {
        //         notEmpty: {
        //             msg: i18n_Validation.__('required')
        //         },   
        //     }
        // },
        // description: {
        //     type: DataTypes.STRING,
        //     validate: {
        //         notEmpty: {
        //             msg: i18n_Validation.__('required')
        //         },   
        //     }
        // },
        // settlement: {
        //     type: DataTypes.STRING,
        //     validate: {
        //         notEmpty: {
        //             msg: i18n_Validation.__('required')
        //         },   
        //     }
        // },
        // discount: {
        //     type: DataTypes.STRING,
        //     validate: {
        //         notEmpty: {
        //             msg: i18n_Validation.__('required')
        //         },   
        //     }
        // },
        taxable_value: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: i18n_Validation.__('required')
                },   
            }
        },
        cgst_amount: {
            type: DataTypes.STRING,
            // validate: {
            //     notEmpty: {
            //         msg: i18n_Validation.__('required')
            //     },   
            // }
        },
        // igst: {
        //     type: DataTypes.STRING,
        //     validate: {
        //         notEmpty: {
        //             msg: i18n_Validation.__('required')
        //         },   
        //     }
        // },
        igst_amount: {
            type: DataTypes.STRING,
            // validate: {
            //     notEmpty: {
            //         msg: i18n_Validation.__('required')
            //     },   
            // }
        },
        // sgst: {
        //     type: DataTypes.STRING,
        //     validate: {
        //         notEmpty: {
        //             msg: i18n_Validation.__('required')
        //         },   
        //     }
        // },
        sgst_amount: {
            type: DataTypes.STRING,
            // validate: {
            //     notEmpty: {
            //         msg: i18n_Validation.__('required')
            //     },   
            // }
        },
        // gst_amt: {
        //     type: DataTypes.STRING,
        //     validate: {
        //         notEmpty: {
        //             msg: i18n_Validation.__('required')
        //         },   
        //     }
        // },
        tcs: {
            type: DataTypes.STRING,
            get() {
                console.log("4")
                if(this.getDataValue('tcs') && typeof this.getDataValue('tcs') !== "undefined"){
                    return this.getDataValue('tcs').split(';')
                }
                return null;
            },
            set(val) {
                if(Array.isArray(val)){
                    return this.setDataValue('tcs',val.join(';'));
                } 
                return null;
            },
        },
        total_value: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: i18n_Validation.__('required')
                },   
            }
        },        
        payment_status: {
            type: DataTypes.STRING,            
        },
        payment_remaining: {
            type: DataTypes.STRING,
        },
        itc: {
            type: DataTypes.STRING,
        },
        gst2a: {
            type: DataTypes.STRING,
        },
        gst_receive_amt: {
            type: DataTypes.STRING,
        },
    },
    {
      tableName: 'purchases',
  });  
  myModel.associate = (models) => {
    myModel.belongsTo(sequelize.models.Account, {foreignKey: 'account_id', as: 'Account'});
  };
  myModel.getAllValues = function (req, res) {

    req.where.company_id = req.siteVariable.session.user.Company.id;
    var accountToPurchae = myModel.belongsTo(sequelize.models.Account, {foreignKey: 'account_id'});
    var purchaseItemToPurchae = myModel.hasMany(sequelize.models.PurchaseItems, {foreignKey: 'purchase_id'});
    var paymentToPurchae = myModel.hasMany(sequelize.models.PaymentPurchase, {foreignKey: 'purchase_id'});
    var AccountToGroup = sequelize.models.Account.belongsTo(sequelize.models.Group, {foreignKey: 'group_id'});
    // var purchaseItemToItem = sequelize.models.PurchaseItems.belongsTo(sequelize.models.Item, {foreignKey: 'item_id'});
    this.findAll({
            where: req.where,
            include: [
                // {model: sequelize.models.Account, as: 'Account'}
                accountToPurchae,
                purchaseItemToPurchae,
                paymentToPurchae,
                {association: accountToPurchae, include: [{association: AccountToGroup, include: []}]},
            ],
            order: req.order    
        },    
    )
        .then(function(results){
            res(results);
        })
    }    
    myModel.getFirstValues = function (req, res) {
        req.where.company_id = req.siteVariable.session.user.Company.id;
        var purchaseToPurchaseItems = myModel.hasMany(sequelize.models.PurchaseItems, {foreignKey: 'purchase_id'});
        var purchaseToOtherTax = myModel.hasMany(sequelize.models.OtherTax, {foreignKey: 'purchase_id'});
        this.findOne({where: req.where, 
            include: [
                {model: sequelize.models.Account, as: 'Account'},
                purchaseToPurchaseItems,
                purchaseToOtherTax
            ]
        }).then(function (results) {
            res(results);
        });
    }
    myModel.getPurchasesByAccount = function (req, res) {
        req.where.company_id = req.siteVariable.session.user.Company.id;
        var paymentToPurchae = myModel.hasMany(sequelize.models.PaymentPurchase, {foreignKey: 'purchase_id'});
        this.findAll({where: req.where,
            include: [
                paymentToPurchae
            ],
        }).then(function (results) {
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
    return myModel;
};