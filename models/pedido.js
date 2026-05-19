'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class pedido extends Model {
    static associate(models) {
      pedido.belongsTo(models.usuario, {
        foreignKey: 'usuarioid',
      });
      pedido.hasMany(models.detallepedido, {
        as: 'detalles',
        foreignKey: 'pedidoid',
      });
    }
  }

  pedido.init(
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
      fecha: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      estado: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Recibido',
      },
    },
    {
      sequelize,
      freezeTableName: true,
      modelName: 'pedido',
    }
  );
  return pedido;
};
