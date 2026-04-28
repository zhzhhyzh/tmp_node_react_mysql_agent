const { AgentOrchestrator } = require('../agent/orchestrator');

const orchestrator = new AgentOrchestrator();

async function chat(req, res, next) {
  try {
    const { message, history } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'BadRequest', message: 'message is required' });
    }

    const baseMessages = Array.isArray(history) ? history : [];
    const messages = [
      ...baseMessages,
      { role: 'user', content: message },
    ];

    const result = await orchestrator.run({
      messages,
      ctx: { profileId: req.user.profileId, username: req.user.username },
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { chat };
