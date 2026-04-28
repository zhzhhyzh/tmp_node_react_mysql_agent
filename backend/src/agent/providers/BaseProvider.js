/**
 * BaseProvider defines the contract every LLM integration must satisfy.
 *
 * Implementations must return:
 *   { content: string, toolCalls: Array<{ name: string, arguments?: object }> }
 *
 * When toolCalls is non-empty the orchestrator will execute the tools and
 * re-invoke chat() with the tool results appended as messages.
 */
class BaseProvider {
  // eslint-disable-next-line no-unused-vars
  async chat({ messages, tools }) {
    throw new Error('BaseProvider.chat() must be implemented by a subclass');
  }
}

module.exports = { BaseProvider };
