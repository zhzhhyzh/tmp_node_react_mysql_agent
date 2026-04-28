const authService = require('../services/authService');

async function register(req, res, next) {
  try {
    const data = await authService.register(req.body || {});
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const data = await authService.login(req.body || {});
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await authService.getMe(req.user.profileId);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me };
