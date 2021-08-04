//translation module with dynamic json storage
var i18n_Validation = new (require('i18n-2'))({
  // setup some locales - other locales default to the first locale
  locales: ['en_valiation']
});

i18n_Validation.setLocale('en_valiation');

module.exports = function (sequelize, DataTypes) {
  var myModel = sequelize.define("Item",
    {
        category_id: {
            type: DataTypes.INTEGER,
            validate: {
                notEmpty: {
                    msg: i18n_Validation.__('required')
                },   
            }
        },
        // company_id: {
        //     type: DataTypes.INTEGER,
        //     validate: {
        //         notEmpty: {
        //             msg: i18n_Validation.__('required')
        //         },   
        //     }
        // },
        item_name: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: i18n_Validation.__('required')
                },   
            }
        },
        item_code: {
            type: DataTypes.STRING,            
        },
        hsn_code: {
            type: DataTypes.STRING,
            validate: {
                min: function (value) {
                    console.log("!!!!", value.length)
                    if (parseInt(value.length) != 0 && parseInt(value.length) !== 8) {
                        throw new Error(i18n_Validation.__('fix_length', '8'))
                    }
                },    
            }
        },
        unit: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: i18n_Validation.__('required')
                },   
            }
        },
        wastage: {
            type: DataTypes.STRING,            
        },
        gstin: {
            type: DataTypes.STRING,  
            // validate: {
            //     notEmpty: {
            //         msg: i18n_Validation.__('required')
            //     },   
            // }          
        },
        status: {
            type: DataTypes.INTEGER,
        },
    },
    {
      tableName: 'items',
  });  
  myModel.getAllValues = function (req, res) {
    // req.where.company_id = req.siteVariable.session.user.Company.id;
    var itemToCategory = myModel.belongsTo(sequelize.models.Category, {foreignKey: 'category_id'});
    var itemToSub = myModel.hasMany(sequelize.models.SubItem, {foreignKey: 'item_id'});
    this.findAll({
        where: req.where, 
        order: ['item_name'],
        include: [
            itemToCategory,
            itemToSub
        ]
    })
        .then(function(results){
            res(results);
        })
    }    
    myModel.getFirstValues = function (req, res) {
        // req.where.company_id = req.siteVariable.session.user.Company.id;
        var itemToSubItem = myModel.hasMany(sequelize.models.SubItem, {foreignKey: 'item_id'});
        var itemToFinishedItem = myModel.hasMany(sequelize.models.FinishedItem, {foreignKey: 'item_id'});
        this.findOne({where: req.where,
            include: [
                itemToSubItem,
                itemToFinishedItem
            ]
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