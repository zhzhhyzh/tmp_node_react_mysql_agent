const { sequelize } = require('../config/db');

const UserProfile = require('./UserProfile')(sequelize);
const UserLogin = require('./UserLogin')(sequelize);
const UserAccount = require('./UserAccount')(sequelize);
const Item = require('./Item')(sequelize);

// Associations
UserProfile.hasOne(UserLogin, { foreignKey: 'user_profile_id', as: 'login', onDelete: 'CASCADE' });
UserLogin.belongsTo(UserProfile, { foreignKey: 'user_profile_id', as: 'profile' });

UserProfile.hasOne(UserAccount, { foreignKey: 'user_profile_id', as: 'account', onDelete: 'CASCADE' });
UserAccount.belongsTo(UserProfile, { foreignKey: 'user_profile_id', as: 'profile' });

UserProfile.hasMany(Item, { foreignKey: 'user_profile_id', as: 'items', onDelete: 'CASCADE' });
Item.belongsTo(UserProfile, { foreignKey: 'user_profile_id', as: 'owner' });

module.exports = {
  sequelize,
  UserProfile,
  UserLogin,
  UserAccount,
  Item,
};
