//translation module with dynamic json storage
var i18n_Validation = new (require('i18n-2'))({
  // setup some locales - other locales default to the first locale
  locales: ['en_valiation']
});

i18n_Validation.setLocale('en_valiation');
var moment = require('moment');

module.exports = function (sequelize, DataTypes) {
  var myModel = sequelize.define("Invoice",
    {
        invoice_no: {
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
        // account_no: {
        //     type: DataTypes.STRING,
        // },
        date: {
            type: DataTypes.DATEONLY,
            get() {
                if(this.getDataValue('date') && typeof this.getDataValue('date') !== "undefined"){
                    return moment(this.getDataValue('date'), "YYYY-MM-DD").format("DD-MM-YYYY");
                }
                return null;
            },
            validate: {
                notEmpty: {
                    msg: i18n_Validation.__('required')
                },   
            }
        },
        consignee_no: {
            type: DataTypes.INTEGER,     
            validate: {
                notEmpty: {
                    msg: i18n_Validation.__('required')
                },   
            }       
        },
        buyer: {
            type: DataTypes.INTEGER,
            validate: {
                notEmpty: {
                    msg: i18n_Validation.__('required')
                },   
            }
        },
        buyer_add: {
            type: DataTypes.STRING,
            // validate: {
            //     notEmpty: {
            //         msg: i18n_Validation.__('required')
            //     },   
            // }
        },
        driver_no: {
            type: DataTypes.STRING,            
        },
        // challan_date: {
        //     type: DataTypes.DATEONLY,
        // },
        time_of_remeber: {
            type: DataTypes.STRING,
        },
        order_no: {
            type: DataTypes.STRING,
        },
        order_date: {
            type: DataTypes.DATEONLY,
        },
        transaction_mode: {
            type: DataTypes.STRING,
        },
        eway_bill_no: {
            type: DataTypes.STRING,
        },
        dispach_through: {
            type: DataTypes.STRING,
        },
        delivery_at: {
            type: DataTypes.STRING,
        },
        vehicle_no: {
            type: DataTypes.STRING,
        },
        rr_gr_no: {
            type: DataTypes.STRING,
        },
        rr_date: {
            type: DataTypes.DATEONLY,
        },
        freight: {
            type: DataTypes.STRING,
        },
        pay_by: {
            type: DataTypes.STRING,
        },
        payment_terms: {
            type: DataTypes.STRING,
        },
        irn: {
            type: DataTypes.STRING,
        },
        sub_total: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: i18n_Validation.__('required')
                },   
            }
        },
        discount: {
            type: DataTypes.STRING,
            // validate: {
            //     notEmpty: {
            //         msg: i18n_Validation.__('required')
            //     },   
            // }
        },
        amount: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: i18n_Validation.__('required')
                },   
            }
        },
        transportation: {
            type: DataTypes.STRING,
            // validate: {
            //     notEmpty: {
            //         msg: i18n_Validation.__('required')
            //     },   
            // }
        },
        // cgst: {
        //     type: DataTypes.STRING,
        //     validate: {
        //         notEmpty: {
        //             msg: i18n_Validation.__('required')
        //         },   
        //     }
        // },
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
        total_GST: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: i18n_Validation.__('required')
                },   
            }
        },
        sgst_amount: {
            type: DataTypes.STRING,
            // validate: {
            //     notEmpty: {
            //         msg: i18n_Validation.__('required')
            //     },   
            // }
        },
        net_amount: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: i18n_Validation.__('required')
                },   
            }
        },
        round_off: {
            type: DataTypes.STRING
        },
        payment_status: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: i18n_Validation.__('required')
                },   
            }
        },
        payment_remaining: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: i18n_Validation.__('required')
                },   
            }
        },
    },
    {
      tableName: 'invoices',
  });  

    myModel.associate = (models) => {
        myModel.belongsTo(sequelize.models.Account, {foreignKey: 'consignee_no', as: 'Consignee'});
        myModel.belongsTo(sequelize.models.Account, {as: 'Buyer', foreignKey: 'buyer'});
        // sequelize.models.Account.belongsTo(sequelize.models.Group, {foreignKey: 'group_id'});
    };

  myModel.getAllValues = function (req, res) {
    // let grpCond = req.condition && req.condition.grp ? req.condition.grp : {};
    req.where.company_id = req.siteVariable.session.user.Company.id;
    var invoiceItemToInvoice = myModel.hasMany(sequelize.models.InvoiceItem, {foreignKey: 'invoice_id'});
    // if( !myModel.hasAlias('Consignee') ){
        // var consigneeToInvoice = myModel.belongsTo(sequelize.models.Account, {as: "Consignee", foreignKey: 'consignee_no'});
    // }
    var InvoiceItemToItem = sequelize.models.InvoiceItem.belongsTo(sequelize.models.Item, {foreignKey: 'item_id'});
    var AccountToGroup = sequelize.models.Account.belongsTo(sequelize.models.Group, {foreignKey: 'group_id'});
    this.findAll({where: req.where, 
        include: [
            {association: invoiceItemToInvoice, include: [{association: InvoiceItemToItem, include: []}]},
            {model: sequelize.models.Account, as: 'Consignee'},
            {model: sequelize.models.Account, as: 'Buyer', include: [{association: AccountToGroup, include: []}]}
            // consigneeToInvoice
        ],
        order: [["createdAt", "DESC"]]
    })
        .then(function(results){
            res(results);
        })
    }    
    myModel.getFirstValues = function (req, res) {
        req.where.company_id = req.siteVariable.session.user.Company.id;
        var invoiceItemToInvoice = myModel.hasMany(sequelize.models.InvoiceItem, {foreignKey: 'invoice_id'});
        var otherTaxToInvoice = myModel.hasMany(sequelize.models.OtherTax, {foreignKey: 'invoice_id'});
        var AccountToGroup = sequelize.models.Account.belongsTo(sequelize.models.Group, {foreignKey: 'group_id'});
        // if( !myModel.hasAlias('Consignee') ){
        //     var consigneeToInvoice = myModel.belongsTo(sequelize.models.Account, {as: "Consignee", foreignKey: 'consignee_no'});
        // }
        // if( !myModel.hasAlias('Buyer') ){
        //     var buyerToInvoice = myModel.belongsTo(sequelize.models.Account, {as: 'Buyer', foreignKey: 'buyer'});
        // }
        var InvoiceItemToItem = sequelize.models.InvoiceItem.belongsTo(sequelize.models.Item, {foreignKey: 'item_id'});
        this.findOne({
            where: req.where,
            include : [
                // consigneeToInvoice,
                // buyerToInvoice,
                otherTaxToInvoice,
                {association: invoiceItemToInvoice, include: [{association: InvoiceItemToItem, include: []}]},
                {model: sequelize.models.Account, as: 'Buyer', include: [{association: AccountToGroup, include: []}]}
            ]
        }).then(function (results) {
            res(results);
        });
    }
    myModel.getInvoiceByAccount = function (req, res) {
        req.where.company_id = req.siteVariable.session.user.Company.id;
        var paymentToInvoice = myModel.hasMany(sequelize.models.PaymentReceivedInvoice, {foreignKey: 'invoice_id'});
        this.findAll({where: req.where,
            include: [
                paymentToInvoice
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
        console.log("@@@", req.body);
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