'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '../../components/Nav';

function formatCLP(amount) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount || 0);
}

const ACCOUNT_TYPE_LABELS = {
  CORRIENTE: 'Cuenta corriente',
  VISTA: 'Cuenta vista',
  AHORRO: 'Cuenta de ahorro',
  OTRO: 'Otra',
};

export default function CuentasPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

const [form, setForm] = useState({
  name: '', bank: '', accountType: 'CORRIENTE', initialBalance: '', color: '#22d3ee',
});
  const [saving, setSaving] = useState(false);

const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', bank: '', accountType: 'CORRIENTE', initialBalance: '', color: '#22d3ee' });
  const [editError, setEditError] = useState('');
  const [editSaving, setEditSaving] = useState(false);

async function load() {
  setLoading(true);
  setError('');
  try {
    const res = await fetch('/api/accounts');
    if (res.status === 401) {
      router.push('/login');
      return;
    }
    const data = await res.json();
    setAccounts(Array.isArray(data) ? data : []);
  } catch (e) {
    setError('Error de conexion');
  } finally {
    setLoading(false);
  }
}

useEffect(() => {
  load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

async function handleAdd(e) {
  e.preventDefault();
  setSaving(true);
  setError('');
  try {
    const res = await fetch('/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Error al crear cuenta');
    } else {
      setForm({ name: '', bank: '', accountType: 'CORRIENTE', initialBalance: '', color: '#22d3ee' });
      load();
    }
  } catch (e) {
    setError('Error de conexion');
  } finally {
    setSaving(false);
  }
}

async function handleDelete(id) {
  if (!confirm('Eliminar esta cuenta?')) return;
  const res = await fetch(`/api/accounts/${id}`, { method: 'DELETE' });
  if (res.ok) {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  }
}

function startEdit(a) {
  setEditForm({
    name: a.name || '',
    bank: a.bank || '',
    accountType: a.account_type || 'CORRIENTE',
    initialBalance: String(a.initial_balance || 0),
    color: a.color || '#22d3ee',
  });
  setEditingId(a.id);
  setEditError('');
}

function cancelEdit() {
  setEditingId(null);
  setEditError('');
}

async function handleEditSave(e) {
  e.preventDefault();
  setEditSaving(true);
  setEditError('');
  try {
    const res = await fetch(`/api/accounts/${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    });
    const data = await res.json();
    if (!res.ok) {
      setEditError(data.error || 'Error al actualizar cuenta');
    } else {
      setEditingId(null);
      load();
    }
  } catch (e) {
    setEditError('Error de conexion');
  } finally {
    setEditSaving(false);
  }
}

return (
  <div className="page">
  <Nav />
  <h1>Cuentas corrientes</h1>
  {error && <div className="error">{error}</div>}

   {loading ? (
     <p>Cargando...</p>
     ) : accounts.length === 0 ? (
     <p className="hint">No tienes cuentas registradas.</p>
    ) : (
      <div className="card-grid">
      {accounts.map((a) => (
      <div key={a.id} className="credit-card-item" style={{ borderTop: `4px solid ${a.color || '#22d3ee'}` }}>
  <div className="credit-card-header">
     <strong>{a.name}</strong>
   <div style={{ display: 'flex', gap: '8px' }}>
<button className="edit-btn" onClick={() => startEdit(a)}>Editar</button>
<button className="delete-btn" onClick={() => handleDelete(a.id)}>Eliminar</button>
  </div>
  </div>
<p className="hint">{a.bank} - {ACCOUNT_TYPE_LABELS[a.account_type] || a.account_type}</p>
<p style={{ fontSize: '20px', fontWeight: 700 }}>{formatCLP(a.balance)}</p>
<p className="hint">Saldo inicial: {formatCLP(a.initial_balance)}</p>
  </div>
))}
</div>
)}

<form className="tx-form" onSubmit={handleAdd}>
  <h3>Agregar cuenta</h3>
<div className="form-row">
  <input type="text" placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
  <input type="text" placeholder="Banco" value={form.bank} onChange={(e) => setForm({ ...form, bank: e.target.value })} />
  <select value={form.accountType} onChange={(e) => setForm({ ...form, accountType: e.target.value })}>
{Object.entries(ACCOUNT_TYPE_LABELS).map(([key, label]) => (
  <option key={key} value={key}>{label}</option>
                                         ))}
</select>
  </div>
<div className="form-row">
  <input type="number" placeholder="Saldo inicial" value={form.initialBalance} onChange={(e) => setForm({ ...form, initialBalance: e.target.value })} />
  <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
  </div>
<button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Agregar cuenta'}</button>
  </form>

{editingId && (
<div className="modal-overlay" onClick={cancelEdit}>
  <div className="modal-content" onClick={(e) => e.stopPropagation()}>
  <h3>Editar cuenta</h3>
<form onSubmit={handleEditSave}>
{editError && <div className="error">{editError}</div>}
<label>
  <span>Nombre</span>
<input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
  </label>
<label>
  <span>Banco</span>
<input type="text" value={editForm.bank} onChange={(e) => setEditForm({ ...editForm, bank: e.target.value })} />
  </label>
<label>
  <span>Tipo de cuenta</span>
<select value={editForm.accountType} onChange={(e) => setEditForm({ ...editForm, accountType: e.target.value })}>
{Object.entries(ACCOUNT_TYPE_LABELS).map(([key, label]) => (
  <option key={key} value={key}>{label}</option>
                                         ))}
</select>
  </label>
<label>
  <span>Saldo inicial</span>
<input type="number" value={editForm.initialBalance} onChange={(e) => setEditForm({ ...editForm, initialBalance: e.target.value })} required />
  </label>
<label>
  <span>Color</span>
<input type="color" value={editForm.color} onChange={(e) => setEditForm({ ...editForm, color: e.target.value })} />
  </label>
<div className="modal-actions">
  <button type="submit" disabled={editSaving}>{editSaving ? 'Guardando...' : 'Guardar'}</button>
<button type="button" className="cancel-btn" onClick={cancelEdit}>Cancelar</button>
  </div>
  </form>
  </div>
  </div>
)}
</div>
);
}
