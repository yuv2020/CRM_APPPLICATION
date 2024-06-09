module.exports = function (sequelize, DataTypes) {
    const file = sequelize.define(
      'file',
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        belongsTo: DataTypes.STRING(255),
        belongsToId: DataTypes.UUID,
        belongsToColumn: DataTypes.STRING(255),
        name: {
          type: DataTypes.STRING(2083),
          allowNull: false,
          validate: {
            notEmpty: true,
          },
        }})
    }