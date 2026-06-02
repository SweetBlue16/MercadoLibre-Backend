'use strict';

const normalizeEmailForLookup = (email) => {
  const value = String(email || '').trim().toLowerCase();
  const atIndex = value.lastIndexOf('@');
  if (atIndex <= 0 || atIndex === value.length - 1) return value;

  let local = value.slice(0, atIndex);
  const domain = value.slice(atIndex + 1);
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    local = local.split('+')[0].replaceAll('.', '');
    return `${local}@gmail.com`;
  }

  return `${local}@${domain}`;
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('usuario', 'normalizedemail', {
      type: Sequelize.STRING(40),
      allowNull: true,
    });

    const usuarios = await queryInterface.sequelize.query('SELECT id, email FROM usuario', {
      type: Sequelize.QueryTypes.SELECT,
    });

    for (const item of usuarios) {
      await queryInterface.sequelize.query('UPDATE usuario SET normalizedemail = ? WHERE id = ?', {
        replacements: [normalizeEmailForLookup(item.email), item.id],
      });
    }

    await queryInterface.changeColumn('usuario', 'normalizedemail', {
      type: Sequelize.STRING(40),
      allowNull: false,
    });
    await queryInterface.addIndex('usuario', ['normalizedemail'], {
      unique: true,
      name: 'usuario_normalizedemail_unique',
    });

    await queryInterface.createTable('pending_user_registration', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(40),
        allowNull: false,
      },
      normalizedemail: {
        type: Sequelize.STRING(40),
        allowNull: false,
        unique: true,
      },
      nombre: {
        type: Sequelize.STRING(40),
        allowNull: false,
      },
      passwordhash: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      codehash: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      expiresat: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      attempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      lastsentat: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      usedat: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('pending_user_registration', ['normalizedemail', 'usedat'], {
      name: 'pending_registration_lookup',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('pending_user_registration');
    await queryInterface.removeIndex('usuario', 'usuario_normalizedemail_unique');
    await queryInterface.removeColumn('usuario', 'normalizedemail');
  },
};
