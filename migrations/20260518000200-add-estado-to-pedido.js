'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('pedido', 'estado', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Recibido',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('pedido', 'estado');
  },
};
