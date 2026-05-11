'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class usuario extends Model {
    static associate(models) {
      usuario.belongsTo(models.rol);
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
    },
    {
      sequelize,
      freezeTableName: true,
      modelName: 'usuario',
      hooks: {
        beforeCreate: async (user) => {
          if (user.passwordhash) {
            const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12;
            user.passwordhash = await bcrypt.hash(user.passwordhash, saltRounds);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed('passwordhash')) {
            const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12;
            user.passwordhash = await bcrypt.hash(user.passwordhash, saltRounds);
          }
        },
      },
    }
  );
  return usuario;
};
