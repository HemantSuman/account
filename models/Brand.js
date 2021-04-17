//translation module with dynamic json storage
var i18n_Validation = new (require('i18n-2'))({
  // setup some locales - other locales default to the first locale
  locales: ['en_valiation']
});

i18n_Validation.setLocale('en_valiation');

module.exports = function (sequelize, DataTypes) {
  var myModel = sequelize.define("Brand",
    {
        name: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: i18n_Validation.__('required')
                },   
                // isEmail: {
                //     msg: i18n_Validation.__('Please_Enter', 'Valid Email Address')
                // },
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
    },
    {
      tableName: 'brands',
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
    // myModel.getCategoryForFront = function (req, res) {
    //     // var menuToMenus = myModel.hasMany(myModel, {foreignKey: 'menu_id'});
    //     var categoryToPost = myModel.hasMany(sequelize.models.Post, {foreignKey: 'category_id'});
    //     this.findAll({where: req.where,
    //             include: [
    //                 categoryToPost
    //             ],
    //         })
    //         .then(function(results){
    //             res(results);
    //         })
    // }
    return myModel;
};