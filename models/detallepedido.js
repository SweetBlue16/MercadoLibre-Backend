'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class detallepedido extends Model {
    static associate(models) {
      detallepedido.belongsTo(models.pedido, {
        foreignKey: 'pedidoid',
      });
      detallepedido.belongsTo(models.producto, {
        foreignKey: 'productoid',
      });
    }
  }

  detallepedido.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      pedidoid: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      productoid: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      titulo: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      sequelize,
      freezeTableName: true,
      modelName: 'detallepedido',
    }
  );
  return detallepedido;
};
