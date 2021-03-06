//translation module with dynamic json storage
var i18n_Validation = new (require('i18n-2'))({
  // setup some locales - other locales default to the first locale
  locales: ['en_valiation']
});

i18n_Validation.setLocale('en_valiation');

module.exports = function (sequelize, DataTypes) {
  var myModel = sequelize.define("User",
    {
        email: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: i18n_Validation.__('required')
                },   
            }
        },
        password: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: i18n_Validation.__('required')
                },   
            }
        },
        first_name: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: i18n_Validation.__('required')
                },   
            }       
        },
        last_name: {
            type: DataTypes.STRING,
            // validate: {
            //     notEmpty: {
            //         msg: i18n_Validation.__('required')
            //     },   
            // }
        },
        role_id: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: i18n_Validation.__('required')
                },   
            }
        },
        status: {
            type: DataTypes.STRING,
        },
    },
    {
      tableName: 'users',
  });  
  myModel.getAllValues = function (req, res) {
    this.findAll({where: req.where})
        .then(function(results){
            res(results);
        })
    }    
    myModel.getFirstValues = function (req, res) {
        this.findOne({where: req.where}).then(function (results) {
            res(results);
        });
    }
    myModel.getUserByEmail = function (req, res) {
        var userToRole = myModel.belongsTo(sequelize.models.Role, {foreignKey: 'role_id'});
        var RoleToPermission = sequelize.models.Role.hasMany(sequelize.models.Permission, {foreignKey: 'role_id'});
        var permissionToModule = sequelize.models.Permission.belongsTo(sequelize.models.Module, {foreignKey: 'module_id'});
        this.findOne({
            where: {email: req},
            include: [
                {association: userToRole, include: [{association: RoleToPermission, include: [{association: permissionToModule}]}]},
                // userToRole,
                // RoleToPermission
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