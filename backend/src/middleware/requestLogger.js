const { randomUUID } = require('crypto');
const logger = require('../utils/logger').child('http');

/**
 * Assigns a request id, logs incoming requests, and logs the response
 * with status code and duration once finished.
 */
function requestLogger(req, res, next) {
  const id = req.headers['x-request-id'] || randomUUID();
  req.id = id;
  res.setHeader('X-Request-Id', id);

  const start = process.hrtime.bigint();

  logger.info('-> request', {
    id,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  });

  res.on('finish', () => {
    const durMs = Number(process.hrtime.bigint() - start) / 1e6;
    const payload = {
      id,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs: Number(durMs.toFixed(2)),
      user: req.user ? req.user.username : undefined,
    };
    if (res.statusCode >= 500) logger.error('<- response', payload);
    else if (res.statusCode >= 400) logger.warn('<- response', payload);
    else logger.info('<- response', payload);
  });

  next();
}

module.exports = { requestLogger };
