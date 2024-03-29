//translation module with dynamic json storage
var i18n_Validation = new (require('i18n-2'))({
  // setup some locales - other locales default to the first locale
  locales: ['en_valiation']
});

i18n_Validation.setLocale('en_valiation');

module.exports = function (sequelize, DataTypes) {
  var myModel = sequelize.define("Production",
    {
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
            // validate: {
            //     notEmpty: {
            //         msg: i18n_Validation.__('required')
            //     },   
            // }          
        },
        company_id: {
            type: DataTypes.INTEGER,
            validate: {
                notEmpty: {
                    msg: i18n_Validation.__('required')
                },   
            }
        },
        brand_id: {
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
        date_of_production: {
            type: DataTypes.DATEONLY,
            validate: {
                notEmpty: {
                    msg: i18n_Validation.__('required')
                },   
            }
        },
        status: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: i18n_Validation.__('required')
                },   
            }
        },        
    },
    {
      tableName: 'productions',
  });  
  myModel.getAllValues = function (req, res) {
    req.where.company_id = req.siteVariable.session.user.Company.id;
    var brandToProduction = myModel.belongsTo(sequelize.models.Brand, {foreignKey: 'brand_id'});
    var itemToProduction = myModel.belongsTo(sequelize.models.Item, {foreignKey: 'item_id'});
    var subitemToProduction = myModel.belongsTo(sequelize.models.SubItem, {foreignKey: 'sub_item_id'});
    // var companyToProduction = myModel.belongsTo(sequelize.models.Company, {foreignKey: 'company_id'});
    
    this.findAll({where: req.where, 
            include: [
                brandToProduction,
                itemToProduction,
                subitemToProduction
            ]
        })
        .then(function(results){
            console.log("resultsresults", results)
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