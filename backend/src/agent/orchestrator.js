const { MockProvider } = require('./providers/MockProvider');
const { getToolByName, describeTools } = require('./tools');
const logger = require('../utils/logger').child('agent');

/**
 * AgentOrchestrator coordinates an LLM provider with a tool registry.
 *
 *  run({ messages, ctx }) loops:
 *    1. Ask provider.chat(messages, tools)
 *    2. If provider returned toolCalls, execute each tool and append
 *       role:"tool" messages, then loop.
 *    3. Otherwise return the final assistant message plus a trace.
 *
 * Swap the provider via the constructor or the AGENT_PROVIDER env var.
 */
class AgentOrchestrator {
  constructor({ provider } = {}) {
    this.provider = provider || buildDefaultProvider();
    this.maxIterations = 4;
    logger.info('orchestrator ready', { provider: this.provider.constructor.name });
  }

  async run({ messages, ctx = {} }) {
    const conversation = [...messages];
    const trace = [];
    const tools = describeTools();

    logger.info('run start', {
      username: ctx.username,
      profileId: ctx.profileId,
      messages: conversation.length,
      tools: tools.map((t) => t.name),
    });

    for (let i = 0; i < this.maxIterations; i += 1) {
      logger.debug('iteration', { i });
      const response = await this.provider.chat({ messages: conversation, tools });
      trace.push({ type: 'assistant', content: response.content, toolCalls: response.toolCalls || [] });

      const toolCalls = response.toolCalls || [];
      logger.debug('provider response', {
        i,
        contentLen: (response.content || '').length,
        toolCalls: toolCalls.map((c) => c.name),
      });

      if (toolCalls.length === 0) {
        conversation.push({ role: 'assistant', content: response.content || '' });
        logger.info('run done', { iterations: i + 1, username: ctx.username });
        return { message: response.content || '', trace, messages: conversation };
      }

      if (response.content) {
        conversation.push({ role: 'assistant', content: response.content });
      }

      for (const call of toolCalls) {
        const tool = getToolByName(call.name);
        if (!tool) {
          const errText = `Tool "${call.name}" not found`;
          logger.warn('tool missing', { name: call.name });
          conversation.push({ role: 'tool', name: call.name, content: JSON.stringify({ error: errText }) });
          trace.push({ type: 'tool', name: call.name, error: errText });
          continue;
        }
        try {
          logger.info('tool call', { name: call.name, arguments: call.arguments || {} });
          const started = Date.now();
          const result = await tool.handler(call.arguments || {}, ctx);
          logger.info('tool ok', { name: call.name, durationMs: Date.now() - started });
          const serialized = JSON.stringify(result);
          conversation.push({ role: 'tool', name: call.name, content: serialized });
          trace.push({ type: 'tool', name: call.name, result });
        } catch (err) {
          const errText = err.message || String(err);
          logger.error('tool failed', { name: call.name, error: errText });
          conversation.push({ role: 'tool', name: call.name, content: JSON.stringify({ error: errText }) });
          trace.push({ type: 'tool', name: call.name, error: errText });
        }
      }
    }

    logger.warn('max iterations reached', { username: ctx.username, iterations: this.maxIterations });
    return {
      message: '[orchestrator] max iterations reached without a final answer',
      trace,
      messages: conversation,
    };
  }
}

function buildDefaultProvider() {
  const name = (process.env.AGENT_PROVIDER || 'mock').toLowerCase();
  switch (name) {
    case 'mock':
    default:
      return new MockProvider();
    // Add cases here as you implement other providers:
    //   case 'openai': return new OpenAIProvider();
    //   case 'huggingface': return new HuggingFaceProvider();
  }
}

module.exports = { AgentOrchestrator, buildDefaultProvider };
