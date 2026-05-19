'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('usuario', 'emailconfirmado', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
    await queryInterface.addColumn('usuario', 'codigoconfirmacionhash', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('usuario', 'codigoconfirmacionexpira', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('usuario', 'intentosconfirmacion', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn('usuario', 'ultimoreenvioconfirmacion', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('usuario', 'resettokenhash', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('usuario', 'resettokenexpira', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('usuario', 'ultimoresetpassword', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('usuario', 'ultimoresetpassword');
    await queryInterface.removeColumn('usuario', 'resettokenexpira');
    await queryInterface.removeColumn('usuario', 'resettokenhash');
    await queryInterface.removeColumn('usuario', 'ultimoreenvioconfirmacion');
    await queryInterface.removeColumn('usuario', 'intentosconfirmacion');
    await queryInterface.removeColumn('usuario', 'codigoconfirmacionexpira');
    await queryInterface.removeColumn('usuario', 'codigoconfirmacionhash');
    await queryInterface.removeColumn('usuario', 'emailconfirmado');
  },
};
