const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserProfile = sequelize.define(
    'UserProfile',
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      full_name: { type: DataTypes.STRING(120), allowNull: false },
      email: { type: DataTypes.STRING(160), allowNull: false, unique: true, validate: { isEmail: true } },
      avatar_url: { type: DataTypes.STRING(500), allowNull: true },
    },
    {
      tableName: 'user_profile',
      timestamps: true,
    }
  );
  return UserProfile;
};
