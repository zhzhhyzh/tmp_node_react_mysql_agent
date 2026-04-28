require('dotenv').config();

const { createApp } = require('./app');
const { sequelize } = require('./models');
const logger = require('./utils/logger').child('server');

const PORT = Number(process.env.PORT || 4000);

async function main() {
  try {
    logger.info('starting', { port: PORT, env: process.env.NODE_ENV || 'development' });

    await sequelize.authenticate();
    logger.info('db connection established');

    // For a zero-config template we auto-sync schema.
    // In production, prefer a migrations tool (e.g. sequelize-cli, umzug).
    await sequelize.sync({ alter: true });
    logger.info('models synchronized');

    const app = createApp();
    app.listen(PORT, () => {
      logger.info('api listening', { url: `http://localhost:${PORT}` });
    });
  } catch (err) {
    logger.error('failed to start server', { message: err.message, stack: err.stack });
    process.exit(1);
  }
}

main();
