const { UserProfile, UserLogin, UserAccount } = require('../models');

async function listUsers(_req, res, next) {
  try {
    const users = await UserProfile.findAll({
      include: [
        { model: UserLogin, as: 'login', attributes: ['username', 'last_login_at'] },
        { model: UserAccount, as: 'account', attributes: ['status', 'role', 'plan'] },
      ],
      order: [['id', 'ASC']],
    });
    res.json({ users });
  } catch (err) { next(err); }
}

module.exports = { listUsers };
