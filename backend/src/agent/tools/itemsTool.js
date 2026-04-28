const itemService = require('../../services/itemService');

/**
 * items.list tool - returns the authenticated user's items.
 *
 * ctx.profileId is injected by the orchestrator from the authenticated request.
 */
const itemsTool = {
  name: 'items.list',
  description: "List the authenticated user's items.",
  parameters: {
    type: 'object',
    properties: {},
  },
  async handler(_args, ctx) {
    const rows = await itemService.list(ctx.profileId);
    return rows.map((r) => ({ id: r.id, name: r.name, description: r.description }));
  },
};

module.exports = { itemsTool };
