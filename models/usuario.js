'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  class usuario extends Model {
    static associate(models) {
      usuario.belongsTo(models.rol);
      usuario.hasMany(models.carrito, {
        foreignKey: 'usuarioid',
      });
      usuario.hasMany(models.pedido, {
        foreignKey: 'usuarioid',
      });
      usuario.hasMany(models.passwordchangetoken, {
        foreignKey: 'usuarioid',
      });
    }
  }
  usuario.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      passwordhash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      protegido: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      rolid: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      emailconfirmado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      codigoconfirmacionhash: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      codigoconfirmacionexpira: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      intentosconfirmacion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      ultimoreenvioconfirmacion: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      resettokenhash: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      resettokenexpira: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      ultimoresetpassword: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      freezeTableName: true,
      modelName: 'usuario',
      hooks: {
        beforeCreate: async (user) => {
          if (user.passwordhash) {
            const saltRounds = Number.parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12;
            user.passwordhash = await bcrypt.hash(user.passwordhash, saltRounds);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed('passwordhash')) {
            const saltRounds = Number.parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12;
            user.passwordhash = await bcrypt.hash(user.passwordhash, saltRounds);
          }
        },
      },
    }
  );
  return usuario;
};
