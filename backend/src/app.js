const express = require('express');
const cors = require('cors');

const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/requestLogger');

function createApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(requestLogger);

  app.get('/health', (_req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

  app.use('/api', routes);

  app.use((req, res) => {
    res.status(404).json({ error: 'NotFound', message: `Route ${req.method} ${req.originalUrl} not found` });
  });

  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
