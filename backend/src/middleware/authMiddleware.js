const { verifyToken } = require('../utils/jwt');
const logger = require('../utils/logger').child('auth:jwt');

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    logger.warn('missing bearer token', { id: req.id, url: req.originalUrl });
    return res.status(401).json({ error: 'Unauthorized', message: 'Missing bearer token' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = {
      profileId: Number(decoded.sub),
      username: decoded.username,
    };
    logger.debug('token verified', { id: req.id, username: req.user.username });
    return next();
  } catch (err) {
    logger.warn('invalid token', { id: req.id, reason: err.message });
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token' });
  }
}

module.exports = { authMiddleware };
