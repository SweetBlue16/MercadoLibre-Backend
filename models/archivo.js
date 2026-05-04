'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class archivo extends Model {
    static associate(models) {
      archivo.hasMany(models.producto, {
        foreignKey: 'id',
      });
    }
  }
  archivo.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      mime: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      size: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      indb: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      datos: {
        type: DataTypes.BLOB('long'),
        allowNull: true,
      },
    },
    {
      sequelize,
      freezeTableName: true,
      modelName: 'archivo',
    }
  );
  return archivo;
};
