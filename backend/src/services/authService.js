const { sequelize, UserProfile, UserLogin, UserAccount } = require('../models');
const { hashPassword, comparePassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');
const logger = require('../utils/logger').child('auth');

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function register({ fullName, email, username, password }) {
  logger.info('register attempt', { username, email });

  if (!fullName || !email || !username || !password) {
    logger.warn('register missing fields', { hasFullName: !!fullName, hasEmail: !!email, hasUsername: !!username });
    throw new HttpError(400, 'fullName, email, username and password are required');
  }
  if (password.length < 6) {
    logger.warn('register weak password', { username });
    throw new HttpError(400, 'password must be at least 6 characters');
  }

  const existingEmail = await UserProfile.findOne({ where: { email } });
  if (existingEmail) {
    logger.warn('register email conflict', { email });
    throw new HttpError(409, 'email is already registered');
  }

  const existingUsername = await UserLogin.findOne({ where: { username } });
  if (existingUsername) {
    logger.warn('register username conflict', { username });
    throw new HttpError(409, 'username is already taken');
  }

  const password_hash = await hashPassword(password);

  const result = await sequelize.transaction(async (t) => {
    const profile = await UserProfile.create(
      { full_name: fullName, email },
      { transaction: t }
    );
    await UserLogin.create(
      { user_profile_id: profile.id, username, password_hash },
      { transaction: t }
    );
    await UserAccount.create(
      { user_profile_id: profile.id, status: 'active', role: 'user', plan: 'free' },
      { transaction: t }
    );
    return profile;
  });

  logger.info('register success', { profileId: result.id, username });
  return buildAuthResponse(result.id, username);
}

async function login({ username, password }) {
  logger.info('login attempt', { username });

  if (!username || !password) {
    logger.warn('login missing credentials', { username });
    throw new HttpError(400, 'username and password are required');
  }

  const loginRow = await UserLogin.findOne({ where: { username } });
  if (!loginRow) {
    logger.warn('login unknown user', { username });
    throw new HttpError(401, 'invalid credentials');
  }

  const ok = await comparePassword(password, loginRow.password_hash);
  if (!ok) {
    await loginRow.increment('failed_attempts');
    logger.warn('login bad password', { username, failedAttempts: loginRow.failed_attempts + 1 });
    throw new HttpError(401, 'invalid credentials');
  }

  const account = await UserAccount.findOne({ where: { user_profile_id: loginRow.user_profile_id } });
  if (account && account.status !== 'active') {
    logger.warn('login disabled account', { username, status: account.status });
    throw new HttpError(403, 'account is disabled');
  }

  loginRow.last_login_at = new Date();
  loginRow.failed_attempts = 0;
  await loginRow.save();

  logger.info('login success', { username, profileId: loginRow.user_profile_id });
  return buildAuthResponse(loginRow.user_profile_id, username);
}

async function getMe(profileId) {
  logger.debug('getMe', { profileId });
  const profile = await UserProfile.findByPk(profileId, {
    include: [
      { model: UserLogin, as: 'login', attributes: ['username', 'last_login_at'] },
      { model: UserAccount, as: 'account', attributes: ['status', 'role', 'plan'] },
    ],
  });
  if (!profile) {
    logger.warn('getMe not found', { profileId });
    throw new HttpError(404, 'user not found');
  }
  return profile;
}

async function buildAuthResponse(profileId, username) {
  const token = signToken({ sub: String(profileId), username });
  const user = await getMe(profileId);
  return { token, user };
}

module.exports = { register, login, getMe, HttpError };
