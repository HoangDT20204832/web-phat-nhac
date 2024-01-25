'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Singers extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Singers.init({
    name_singer: DataTypes.STRING,
    bio: DataTypes.STRING,
    sex: DataTypes.STRING,
    debut_year: DataTypes.STRING,
    country: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Singers',
  });
  return Singers;
};