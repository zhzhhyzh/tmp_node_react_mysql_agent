const itemService = require('../services/itemService');

async function list(req, res, next) {
  try {
    const items = await itemService.list(req.user.profileId);
    res.json({ items });
  } catch (err) { next(err); }
}

async function get(req, res, next) {
  try {
    const item = await itemService.get(Number(req.params.id), req.user.profileId);
    res.json({ item });
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const item = await itemService.create(req.user.profileId, req.body || {});
    res.status(201).json({ item });
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const item = await itemService.update(Number(req.params.id), req.user.profileId, req.body || {});
    res.json({ item });
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const data = await itemService.remove(Number(req.params.id), req.user.profileId);
    res.json(data);
  } catch (err) { next(err); }
}

module.exports = { list, get, create, update, remove };
