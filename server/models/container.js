'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Container extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Container.hasOne(models.container, {foreignKey: 'container', as: 'container_fk'})
    }
  }
  Container.init({
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    image_path: DataTypes.STRING,
    container: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'container',
    freezeTableName: true,
    timestamps: true,
  });
  return Container;
};