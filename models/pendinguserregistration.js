'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcrypt');

const isBcryptHash = (value) => /^\$2[aby]\$\d{2}\$/.test(String(value || ''));

module.exports = (sequelize, DataTypes) => {
  class pendinguserregistration extends Model {}

  pendinguserregistration.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING(40),
        allowNull: false,
      },
      normalizedemail: {
        type: DataTypes.STRING(40),
        allowNull: false,
        unique: true,
      },
      nombre: {
        type: DataTypes.STRING(40),
        allowNull: false,
      },
      passwordhash: {
        type: DataTypes.STRING,
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
      lastsentat: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      usedat: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      freezeTableName: true,
      tableName: 'pending_user_registration',
      modelName: 'pendinguserregistration',
      hooks: {
        beforeCreate: async (registration) => {
          if (registration.passwordhash && !isBcryptHash(registration.passwordhash)) {
            const saltRounds = Number.parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12;
            registration.passwordhash = await bcrypt.hash(registration.passwordhash, saltRounds);
          }
        },
        beforeUpdate: async (registration) => {
          if (registration.changed('passwordhash') && !isBcryptHash(registration.passwordhash)) {
            const saltRounds = Number.parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12;
            registration.passwordhash = await bcrypt.hash(registration.passwordhash, saltRounds);
          }
        },
      },
    }
  );

  return pendinguserregistration;
};
