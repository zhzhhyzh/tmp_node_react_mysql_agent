const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserAccount = sequelize.define(
    'UserAccount',
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      user_profile_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, unique: true },
      status: {
        type: DataTypes.ENUM('active', 'disabled'),
        allowNull: false,
        defaultValue: 'active',
      },
      role: {
        type: DataTypes.ENUM('user', 'admin'),
        allowNull: false,
        defaultValue: 'user',
      },
      plan: { type: DataTypes.STRING(40), allowNull: false, defaultValue: 'free' },
    },
    {
      tableName: 'user_account',
      timestamps: true,
    }
  );
  return UserAccount;
};
