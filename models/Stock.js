//translation module with dynamic json storage
var i18n_Validation = new (require('i18n-2'))({
  // setup some locales - other locales default to the first locale
  locales: ['en_valiation']
});

i18n_Validation.setLocale('en_valiation');

module.exports = function (sequelize, DataTypes) {
  var myModel = sequelize.define("Stock",
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
        no_of_pkg: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: i18n_Validation.__('required')
                },   
            }
        },   
        type: {
            type: DataTypes.STRING,
        },     
    },
    {
      tableName: 'stocks',
  });  
  myModel.getAllValues = function (req, res) {
    var itemToStock = myModel.belongsTo(sequelize.models.Item, {foreignKey: 'item_id'});
    var itemSubToStock = myModel.belongsTo(sequelize.models.SubItem, {foreignKey: 'sub_item_id', as: "subItems"});
    this.findAll({where: req.where, 
        include: [
            itemToStock,
            itemSubToStock
        ]
    })
        .then(function(results){
            res(results);
        })
    }    
    myModel.getFirstValues = function (req, res) {
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
        // if(req.body.order === ''){
        //     req.body.order = 0;
        // }
        console.log("update", req.body)
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