'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Item extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Item.hasOne(models.Container, {foreignKey: 'container', as: 'container_fk'})
    }
  }
  Item.init({
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    image_path: DataTypes.STRING,
    container: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Item',
    freezeTableName: true,
    timestamps: true,
  });
  return Item;
};