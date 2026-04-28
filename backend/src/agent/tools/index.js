const { itemsTool } = require('./itemsTool');

/**
 * Registry of tools available to the agent.
 * Add your own by pushing objects that match the BaseProvider tool contract.
 */
const tools = [itemsTool];

function getToolByName(name) {
  return tools.find((t) => t.name === name);
}

function describeTools() {
  return tools.map(({ name, description, parameters }) => ({ name, description, parameters }));
}

module.exports = { tools, getToolByName, describeTools };
