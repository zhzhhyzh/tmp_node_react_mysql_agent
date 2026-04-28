const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserLogin = sequelize.define(
    'UserLogin',
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      user_profile_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, unique: true },
      username: { type: DataTypes.STRING(64), allowNull: false, unique: true },
      password_hash: { type: DataTypes.STRING(255), allowNull: false },
      last_login_at: { type: DataTypes.DATE, allowNull: true },
      failed_attempts: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
    },
    {
      tableName: 'user_login',
      timestamps: true,
    }
  );
  return UserLogin;
};
