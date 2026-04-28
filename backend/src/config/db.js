const { Sequelize } = require('sequelize');
const logger = require('../utils/logger').child('sql');

const {
  DB_HOST = '127.0.0.1',
  DB_PORT = '3306',
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_NAME = 'app_db',
  NODE_ENV = 'development',
} = process.env;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: Number(DB_PORT),
  dialect: 'mysql',
  logging: NODE_ENV === 'development' ? (msg) => logger.debug(msg) : false,
  define: {
    underscored: true,
    freezeTableName: false,
  },
  pool: { max: 10, min: 0, idle: 10_000 },
});

module.exports = { sequelize };
