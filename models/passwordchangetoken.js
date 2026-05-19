'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class passwordchangetoken extends Model {
    static associate(models) {
      passwordchangetoken.belongsTo(models.usuario, {
        foreignKey: 'usuarioid',
      });
    }
  }

  passwordchangetoken.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      usuarioid: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      codehash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      expiresat: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      attempts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      usedat: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      freezeTableName: true,
      tableName: 'password_change_tokens',
      modelName: 'passwordchangetoken',
    }
  );

  return passwordchangetoken;
};
