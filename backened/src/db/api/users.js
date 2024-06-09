const db = require('../models');
const FileDBApi = require('./file');
const crypto = require('crypto');
const Utils = require('../utils');

const bcrypt = require('bcrypt');
const config = require('../../config');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class UsersDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const users = await db.users.create(
      {
        id: data.data.id || undefined,

        firstName: data.data.firstName || null,
        lastName: data.data.lastName || null,
        phoneNumber: data.data.phoneNumber || null,
        email: data.data.email || null,
        disabled: data.data.disabled || false,

        password: data.data.password || null,
        emailVerified: data.data.emailVerified || true,

        emailVerificationToken: data.data.emailVerificationToken || null,
        emailVerificationTokenExpiresAt:
          data.data.emailVerificationTokenExpiresAt || null,
        passwordResetToken: data.data.passwordResetToken || null,
        passwordResetTokenExpiresAt:
          data.data.passwordResetTokenExpiresAt || null,
        provider: data.data.provider || null,
        importHash: data.data.importHash || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    if (!data.data.app_role) {
      const role = await db.roles.findOne({
        where: { name: 'User' },
      });
      if (role) {
        await users.setApp_role(role, {
          transaction,
        });
      }
    } else {
      await users.setApp_role(data.data.app_role || null, {
        transaction,
      });
    }

    await users.setCustom_permissions(data.data.custom_permissions || [], {
      transaction,
    });

    await FileDBApi.replaceRelationFiles(
      {
        belongsTo: db.users.getTableName(),
        belongsToColumn: 'avatar',
        belongsToId: users.id,
      },
      data.data.avatar,
      options,
    );

    return users;
  }

  static async bulkImport(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    // Prepare data - wrapping individual data transformations in a map() method
    const usersData = data.map((item, index) => ({
      id: item.id || undefined,

      firstName: item.firstName || null,
      lastName: item.lastName || null,
      phoneNumber: item.phoneNumber || null,
      email: item.email || null,
      disabled: item.disabled || false,

      password: item.password || null,
      emailVerified: item.emailVerified || false,

      emailVerificationToken: item.emailVerificationToken || null,
      emailVerificationTokenExpiresAt:
        item.emailVerificationTokenExpiresAt || null,
      passwordResetToken: item.passwordResetToken || null,
      passwordResetTokenExpiresAt: item.passwordResetTokenExpiresAt || null,
      provider: item.provider || null,
      importHash: item.importHash || null,
      createdById: currentUser.id,
      updatedById: currentUser.id,
      createdAt: new Date(Date.now() + index * 1000),
    }));

    // Bulk create items
    const users = await db.users.bulkCreate(usersData, { transaction });

    // For each item created, replace relation files

    for (let i = 0; i < users.length; i++) {
      await FileDBApi.replaceRelationFiles(
        {
          belongsTo: db.users.getTableName(),
          belongsToColumn: 'avatar',
          belongsToId: users[i].id,
        },
        data[i].avatar,
        options,
      );
    }

    return users;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const users = await db.users.findByPk(id, {}, { transaction });

    if (!data?.app_role) {
      data.app_role = users?.app_role?.id;
    }
    if (!data?.custom_permissions) {
      data.custom_permissions = users?.custom_permissions?.map(
        (item) => item.id,
      );
    }

    if (data.password) {
      data.password = bcrypt.hashSync(data.password, config.bcrypt.saltRounds);
    } else {
      data.password = users.password;
    }

    await users.update(
      {
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        phoneNumber: data.phoneNumber || null,
        email: data.email || null,
        disabled: data.disabled || false,

        password: data.password || null,
        emailVerified: data.emailVerified || true,

        emailVerificationToken: data.emailVerificationToken || null,
        emailVerificationTokenExpiresAt:
          data.emailVerificationTokenExpiresAt || null,
        passwordResetToken: data.passwordResetToken || null,
        passwordResetTokenExpiresAt: data.passwordResetTokenExpiresAt || null,
        provider: data.provider || null,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await users.setApp_role(data.app_role || null, {
      transaction,
    });

    await users.setCustom_permissions(data.custom_permissions || [], {
      transaction,
    });

    await FileDBApi.replaceRelationFiles(
      {
        belongsTo: db.users.getTableName(),
        belongsToColumn: 'avatar',
        belongsToId: users.id,
      },
      data.avatar,
      options,
    );

    return users;
  }

  static async deleteByIds(ids, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const users = await db.users.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
      transaction,
    });

    await db.sequelize.transaction(async (transaction) => {
      for (const record of users) {
        await record.update({ deletedBy: currentUser.id }, { transaction });
      }
      for (const record of users) {
        await record.destroy({ transaction });
      }
    });

    return users;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const users = await db.users.findByPk(id, options);

    await users.update(
      {
        deletedBy: currentUser.id,
      },
      {
        transaction,
      },
    );

    await users.destroy({
      transaction,
    });

    return users;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const users = await db.users.findOne({ where }, { transaction });

    if (!users) {
      return users;
    }

    const output = users.get({ plain: true });

    output.leads_users = await users.getLeads_users({
      transaction,
    });

    output.avatar = await users.getAvatar({
      transaction,
    });

    output.app_role = await users.getApp_role({
      transaction,
    });

    if (output.app_role) {
      output.app_role_permissions = await output.app_role.getPermissions({
        transaction,
      });
    }

    output.custom_permissions = await users.getCustom_permissions({
      transaction,
    });

    return output;
  }

  static async findAll(filter, options) {
    var limit = filter.limit || 0;
    var offset = 0;
    const currentPage = +filter.page;

    offset = currentPage * limit;

    var orderBy = null;

    const transaction = (options && options.transaction) || undefined;
    let where = {};
    let include = [
      {
        model: db.roles,
        as: 'app_role',
      },

      {
        model: db.permissions,
        as: 'custom_permissions',
        through: filter.custom_permissions
          ? {
              where: {
                [Op.or]: filter.custom_permissions.split('|').map((item) => {
                  return { ['Id']: Utils.uuid(item) };
                }),
              },
            }
          : null,
        required: filter.custom_permissions ? true : null,
      },

      {
        model: db.file,
        as: 'avatar',
      },
    ];

    if (filter) {
      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
        };
      }

      if (filter.firstName) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('users', 'firstName', filter.firstName),
        };
      }

      if (filter.lastName) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('users', 'lastName', filter.lastName),
        };
      }}}}