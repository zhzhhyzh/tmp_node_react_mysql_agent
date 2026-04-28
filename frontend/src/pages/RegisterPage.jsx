import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', username: '', password: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 420 }}>
      <div className="card">
        <h2>Create account</h2>
        <form onSubmit={onSubmit} className="flex-col">
          <div className="field">
            <label>Full name</label>
            <input className="input" value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
          </div>
          <div className="field">
            <label>Email</label>
            <input className="input" type="email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="field">
            <label>Username</label>
            <input className="input" value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          </div>
          <div className="field">
            <label>Password (min 6)</label>
            <input className="input" type="password" minLength={6} value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button className="btn" disabled={busy} type="submit">
            {busy ? 'Creating...' : 'Create account'}
          </button>
          {error && <div className="error">{error}</div>}
        </form>
        <p className="muted" style={{ marginTop: 16 }}>
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
