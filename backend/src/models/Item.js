const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Item = sequelize.define(
    'Item',
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      user_profile_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      name: { type: DataTypes.STRING(160), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      tableName: 'items',
      timestamps: true,
    }
  );
  return Item;
};
