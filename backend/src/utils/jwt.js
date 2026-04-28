const jwt = require('jsonwebtoken');

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }
  return secret;
}

function signToken(payload, options = {}) {
  const expiresIn = process.env.JWT_EXPIRES_IN || '1d';
  return jwt.sign(payload, getSecret(), { expiresIn, ...options });
}

function verifyToken(token) {
  return jwt.verify(token, getSecret());
}

module.exports = { signToken, verifyToken };
