'use strict';
const bcrypt = require('bcrypt');
const crypto = require('crypto');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const AdministradorUUID = crypto.randomUUID();
    const UsuarioUUID = crypto.randomUUID();
    const adminPassword = process.env.SEED_ADMIN_PASSWORD;
    const userPassword = process.env.SEED_USER_PASSWORD;

    if (!adminPassword || !userPassword) {
      throw new Error('Defina SEED_ADMIN_PASSWORD y SEED_USER_PASSWORD antes de ejecutar seeders.');
    }

    await queryInterface.bulkInsert('rol', [
      {
        id: AdministradorUUID,
        nombre: 'Administrador',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: UsuarioUUID,
        nombre: 'Usuario',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await queryInterface.bulkInsert('usuario', [
      {
        id: crypto.randomUUID(),
        email: process.env.SEED_ADMIN_EMAIL || 'admin@example.com',
        passwordhash: await bcrypt.hash(adminPassword, 10),
        nombre: 'Guillermo Vera',
        rolid: AdministradorUUID,
        protegido: true,
        emailconfirmado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        email: process.env.SEED_USER_EMAIL || 'user@example.com',
        passwordhash: await bcrypt.hash(userPassword, 10),
        nombre: 'Usuario patito',
        rolid: UsuarioUUID,
        emailconfirmado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('usuario', null, {});
    await queryInterface.bulkDelete('rol', null, {});
  },
};
