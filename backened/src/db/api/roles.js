const db = require('../models');
const FileDBApi = require('./file');
const crypto = require('crypto');
const Utils = require('../utils');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class RolesDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const roles = await db.roles.create(
      {
        id: data.id || undefined,

        name: data.name || null,
        role_customization: data.role_customization || null,
        importHash: data.importHash || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await roles.setPermissions(data.permissions || [], {
      transaction,
    });

    return roles;
  }

  static async bulkImport(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    // Prepare data - wrapping individual data transformations in a map() method
    const rolesData = data.map((item, index) => ({
      id: item.id || undefined,

      name: item.name || null,
      role_customization: item.role_customization || null,
      importHash: item.importHash || null,
      createdById: currentUser.id,
      updatedById: currentUser.id,
      createdAt: new Date(Date.now() + index * 1000),
    }));

    // Bulk create items
    const roles = await db.roles.bulkCreate(rolesData, { transaction });

    // For each item created, replace relation files

    return roles;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const roles = await db.roles.findByPk(id, {}, { transaction });

    await roles.update(
      {
        name: data.name || null,
        role_customization: data.role_customization || null,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await roles.setPermissions(data.permissions || [], {
      transaction,
    });

    return roles;
  }

  static async deleteByIds(ids, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const roles = await db.roles.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
      transaction,
    });

    await db.sequelize.transaction(async (transaction) => {
      for (const record of roles) {
        await record.update({ deletedBy: currentUser.id }, { transaction });
      }
      for (const record of roles) {
        await record.destroy({ transaction });
      }
    });

    return roles;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const roles = await db.roles.findByPk(id, options);

    await roles.update(
      {
        deletedBy: currentUser.id,
      },
      {
        transaction,
      },
    );

    await roles.destroy({
      transaction,
    });

    return roles;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const roles = await db.roles.findOne({ where }, { transaction });

    if (!roles) {
      return roles;
    }

    const output = roles.get({ plain: true });

    output.users_app_role = await roles.getUsers_app_role({
      transaction,
    })}}