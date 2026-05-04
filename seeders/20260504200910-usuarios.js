'use strict';
const bcrypt = require('bcrypt');
const crypto = require('crypto');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const AdministradorUUID = crypto.randomUUID();
    const UsuarioUUID = crypto.randomUUID();

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
        email: 'gvera@uv.mx',
        passwordhash: await bcrypt.hash(
          'pas9L!rX$4vM@3qTz#Np1K^dA7fW*eHyC8tito',
          10
        ),
        nombre: 'Guillermo Vera',
        rolid: AdministradorUUID,
        protegido: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        email: 'patito@uv.mx',
        passwordhash: await bcrypt.hash('Zx3&Pv$Mn7!aRbT2#LkQ@8cEy^JgWu94', 10),
        nombre: 'Usuario patito',
        rolid: UsuarioUUID,
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
