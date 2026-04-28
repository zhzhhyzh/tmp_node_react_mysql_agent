const { Item } = require('../models');
const logger = require('../utils/logger').child('items');

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function list(profileId) {
  logger.info('list', { profileId });
  const rows = await Item.findAll({
    where: { user_profile_id: profileId },
    order: [['id', 'DESC']],
  });
  logger.debug('list result', { profileId, count: rows.length });
  return rows;
}

async function get(id, profileId) {
  logger.debug('get', { id, profileId });
  const item = await Item.findOne({ where: { id, user_profile_id: profileId } });
  if (!item) {
    logger.warn('get not found', { id, profileId });
    throw new HttpError(404, 'item not found');
  }
  return item;
}

async function create(profileId, { name, description }) {
  if (!name) {
    logger.warn('create missing name', { profileId });
    throw new HttpError(400, 'name is required');
  }
  const created = await Item.create({ user_profile_id: profileId, name, description: description || null });
  logger.info('created', { id: created.id, profileId, name });
  return created;
}

async function update(id, profileId, { name, description }) {
  const item = await get(id, profileId);
  if (name !== undefined) item.name = name;
  if (description !== undefined) item.description = description;
  await item.save();
  logger.info('updated', { id, profileId });
  return item;
}

async function remove(id, profileId) {
  const item = await get(id, profileId);
  await item.destroy();
  logger.info('deleted', { id, profileId });
  return { id };
}

module.exports = { list, get, create, update, remove, HttpError };
