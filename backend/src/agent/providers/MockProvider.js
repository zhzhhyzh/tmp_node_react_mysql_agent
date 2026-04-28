const { BaseProvider } = require('./BaseProvider');

/**
 * MockProvider - deterministic, offline demo provider.
 *
 * Rules:
 *  - If the latest user message mentions "items" or "list", request the
 *    `items.list` tool on the first turn.
 *  - After a tool result is observed, produce a final summary string.
 *  - Otherwise, echo a canned reply.
 */
class MockProvider extends BaseProvider {
  async chat({ messages }) {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    const lastTool = [...messages].reverse().find((m) => m.role === 'tool');
    const userText = (lastUser && lastUser.content) || '';

    if (lastTool) {
      let parsed;
      try { parsed = JSON.parse(lastTool.content); } catch { parsed = lastTool.content; }
      const count = Array.isArray(parsed) ? parsed.length : 0;
      return {
        content: `You have ${count} item(s). ${
          count ? 'Latest: ' + (parsed[0].name || '(unnamed)') + '.' : 'Create one to get started.'
        }`,
        toolCalls: [],
      };
    }

    if (/\bitems?\b|\blist\b/i.test(userText)) {
      return { content: '', toolCalls: [{ name: 'items.list', arguments: {} }] };
    }

    return {
      content:
        `MockProvider received: "${userText}". ` +
        'Try asking "list my items" to see tool-calling in action, ' +
        'or plug a real LLM by implementing BaseProvider.',
      toolCalls: [],
    };
  }
}

module.exports = { MockProvider };
