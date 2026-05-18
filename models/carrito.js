'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class carrito extends Model {
    static associate(models) {
      carrito.belongsTo(models.usuario, {
        foreignKey: 'usuarioid',
      });
      carrito.belongsTo(models.producto, {
        foreignKey: 'productoid',
      });
    }
  }

  carrito.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      usuarioid: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      productoid: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          min: 1,
          max: 99,
        },
      },
    },
    {
      sequelize,
      freezeTableName: true,
      modelName: 'carrito',
    }
  );
  return carrito;
};
