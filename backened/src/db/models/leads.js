const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function (sequelize, DataTypes) {
  const leads = sequelize.define(
    'leads',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      status: {
        type: DataTypes.ENUM,

        values: ['created', 'contacted', 'in_progress', 'closed'],
      },

      date: {
        type: DataTypes.DATE,
      },

      notes: {
        type: DataTypes.TEXT,
      }
 })}