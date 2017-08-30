'use strict';
var bcrypt=require("bcrypt-nodejs");
module.exports = function(sequelize, DataTypes) {
  var Users = sequelize.define('Users', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    facebookId: {
      allowNull: true,
      unique: true,
      type: DataTypes.STRING
    },
    googleId: {
      allowNull: true,
      unique: true,
      type: DataTypes.STRING
    },
    username: {
      allowNull: true,
      unique: true,
      type: DataTypes.STRING
    },
    email: {
      allowNull: true,
      unique: true,
      type: DataTypes.STRING,
      validate:{
        isEmail:true
      }
    },
    password: {
      allowNull: true,
      type: DataTypes.STRING
    }
  });
  Users.prototype.validPassword=function(password) {
    return bcrypt.compareSync(password, this.password);
  }
  Users.hook("beforeCreate",function(user,options){
    if(user.password){
      user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10), null);
    }
  });
  Users.associate = function(models) {
    Users.hasMany(models.Comments, {
      foreignKey: {
        allowNull: false
      },
      onDelete: "CASCADE"
    });
  };
  return Users;
};
