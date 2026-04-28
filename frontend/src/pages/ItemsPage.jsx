import { useEffect, useState } from 'react';
import { itemsApi } from '../api/items';

const EMPTY = { id: null, name: '', description: '' };

export default function ItemsPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try { setItems(await itemsApi.list()); }
    catch (err) { setError(err?.response?.data?.message || 'Failed to load items'); }
  };

  useEffect(() => { load(); }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (form.id) {
        await itemsApi.update(form.id, { name: form.name, description: form.description });
      } else {
        await itemsApi.create({ name: form.name, description: form.description });
      }
      setForm(EMPTY);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  const onEdit = (item) => setForm({ id: item.id, name: item.name, description: item.description || '' });

  const onDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try { await itemsApi.remove(id); await load(); }
    catch (err) { setError(err?.response?.data?.message || 'Delete failed'); }
  };

  return (
    <div className="container">
      <h2>Items</h2>

      <div className="card">
        <h3>{form.id ? 'Edit item' : 'New item'}</h3>
        <form onSubmit={onSubmit} className="flex-col">
          <div className="field">
            <label>Name</label>
            <input className="input" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea className="textarea" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="row">
            <button className="btn" type="submit" disabled={busy}>
              {form.id ? 'Update' : 'Create'}
            </button>
            {form.id && (
              <button type="button" className="btn secondary" onClick={() => setForm(EMPTY)}>
                Cancel
              </button>
            )}
          </div>
          {error && <div className="error">{error}</div>}
        </form>
      </div>

      <div className="card">
        <h3>All items</h3>
        {items.length === 0 ? (
          <p className="muted">No items yet.</p>
        ) : (
          <table>
            <thead>
              <tr><th>ID</th><th>Name</th><th>Description</th><th style={{ width: 180 }}>Actions</th></tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td>{it.id}</td>
                  <td>{it.name}</td>
                  <td>{it.description}</td>
                  <td>
                    <button className="btn secondary" onClick={() => onEdit(it)}>Edit</button>{' '}
                    <button className="btn danger" onClick={() => onDelete(it.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
