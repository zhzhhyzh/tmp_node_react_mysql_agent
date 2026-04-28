import { useState } from 'react';
import { agentApi } from '../api/agent';

export default function AgentPage() {
  const [history, setHistory] = useState([]); // messages the backend can consume
  const [ui, setUi] = useState([]);            // rendered messages including tools
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const send = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setBusy(true);
    setError(null);
    setUi((u) => [...u, { role: 'user', content: text }]);
    setInput('');

    try {
      const res = await agentApi.chat(text, history);
      const toolMsgs = (res.trace || [])
        .filter((t) => t.type === 'tool')
        .map((t) => ({ role: 'tool', content: `${t.name}: ${JSON.stringify(t.result ?? t.error)}` }));
      setUi((u) => [...u, ...toolMsgs, { role: 'assistant', content: res.message }]);
      // Persist clean conversation (no tool traces) for the next turn
      setHistory([...(res.messages || []).filter((m) => m.role === 'user' || m.role === 'assistant')]);
    } catch (err) {
      setError(err?.response?.data?.message || 'Agent call failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container">
      <h2>Agent</h2>
      <div className="card">
        <div className="chat">
          {ui.length === 0 && <div className="muted">Try: "list my items"</div>}
          {ui.map((m, i) => (
            <div key={i} className={`msg ${m.role}`}>{m.content}</div>
          ))}
        </div>
        <form onSubmit={send} className="row" style={{ marginTop: 12 }}>
          <input
            className="input"
            placeholder="Ask the agent..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={busy}
          />
          <button className="btn" type="submit" disabled={busy}>
            {busy ? '...' : 'Send'}
          </button>
        </form>
        {error && <div className="error">{error}</div>}
      </div>
    </div>
  );
}
