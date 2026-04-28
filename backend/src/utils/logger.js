/**
 * Minimal zero-dependency structured logger.
 *
 * Usage:
 *   const log = require('./utils/logger').child('auth');
 *   log.info('user registered', { profileId: 1 });
 *
 * Levels: debug < info < warn < error
 * Controlled via LOG_LEVEL env var (default: info; debug when NODE_ENV=development).
 */

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };

function currentLevel() {
  const raw = (process.env.LOG_LEVEL || '').toLowerCase();
  if (LEVELS[raw] !== undefined) return LEVELS[raw];
  return process.env.NODE_ENV === 'development' ? LEVELS.debug : LEVELS.info;
}

function fmt(level, scope, msg, meta) {
  const ts = new Date().toISOString();
  const base = `${ts} [${level.toUpperCase()}] [${scope}] ${msg}`;
  if (meta === undefined) return base;
  try {
    return `${base} ${typeof meta === 'string' ? meta : JSON.stringify(meta)}`;
  } catch {
    return `${base} [unserializable meta]`;
  }
}

function emit(level, scope, msg, meta) {
  if (LEVELS[level] < currentLevel()) return;
  const line = fmt(level, scope, msg, meta);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

function child(scope) {
  return {
    debug: (msg, meta) => emit('debug', scope, msg, meta),
    info:  (msg, meta) => emit('info',  scope, msg, meta),
    warn:  (msg, meta) => emit('warn',  scope, msg, meta),
    error: (msg, meta) => emit('error', scope, msg, meta),
    child: (sub) => child(`${scope}:${sub}`),
  };
}

module.exports = {
  child,
  root: child('app'),
};
