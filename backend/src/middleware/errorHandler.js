/* eslint-disable no-unused-vars */
const logger = require('../utils/logger').child('error');

function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const payload = {
    error: err.name || 'Error',
    message: err.message || 'Internal Server Error',
  };
  if (process.env.NODE_ENV === 'development' && err.stack) {
    payload.stack = err.stack.split('\n').slice(0, 5);
  }

  const meta = {
    id: req.id,
    method: req.method,
    url: req.originalUrl,
    status,
    name: err.name,
    message: err.message,
  };
  if (status >= 500) {
    logger.error('unhandled', { ...meta, stack: err.stack });
  } else {
    logger.warn('handled', meta);
  }

  res.status(status).json(payload);
}

module.exports = { errorHandler };
