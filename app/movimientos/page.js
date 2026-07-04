'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '../../components/Nav';
import { CATEGORY_LABELS, categoryIcon, categoryLabel, categoryColor } from '../../lib/categories';

function formatCLP(amount) {
      return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount);
}

function formatDate(value) {
      return new Date(value).toLocaleDateString('es-CL', { timeZone: 'UTC' });
}

export default function MovimientosPage() {
      const router = useRouter();
      const now = new Date();
      const [month, setMonth] = useState(now.getMonth() + 1);
      const [year, setYear] = useState(now.getFullYear());
      const [items, setItems] = useState([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState('');
      const [form, setForm] = useState({
            date: new Date().toISOString().slice(0, 10),
            description: '',
            amount: '',
            type: 'EXPENSE',
            category: '',
            merchant: '',
      });
      const [saving, setSaving] = useState(false);

async function load() {
      setLoading(true);
      setError('');
      try {
            const res = await fetch(`/api/transactions?month=${month}&year=${year}`);
            if (res.status === 401) {
                  router.push('/login');
                  return;
            }
            const data = await res.json();
            if (!res.ok) {
                  setError(data.error || 'Error al cargar movimientos');
                  setItems([]);
            } else {
                  setItems(data);
            }
      } catch (e) {
            setError('Error de conexion');
      } finally {
            setLoading(false);
      }
}

useEffect(() => {
      load();
      // eslint-disable-next-line react-hooks/exhaustive-deps
}, [month, year]);

async function handleSubmit(e) {
      e.preventDefault();
      setSaving(true);
      setError('');
      try {
            const amountNum = Number(form.amount);
            const signedAmount = form.type === 'EXPENSE' ? -Math.abs(amountNum) : Math.abs(amountNum);
            const res = await fetch('/api/transactions', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ ...form, amount: signedAmount }),
            });
            const data = await res.json();
            if (!res.ok) {
                  setError(data.error || 'Error al crear movimiento');
            } else {
                  setForm({ date: new Date().toISOString().slice(0, 10), description: '', amount: '', type: 'EXPENSE', category: '', merchant: '' });
                  load();
            }
      } catch (e) {
            setError('Error de conexion');
      } finally {
            setSaving(false);
      }
                  }

async function handleDelete(id) {
      if (!confirm('Eliminar este movimiento?')) return;
      try {
            const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
            if (res.ok) {
                  setItems((prev) => prev.filter((t) => t.id !== id));
            }
      } catch (e) {
            // ignore
      }
}

const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

return (
      <div className="page">
      <Nav />
      <h1>Movimientos</h1>

<div className="month-selector">
      <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
{monthNames.map((name, i) => (
      <option key={i} value={i + 1}>{name}</option>
                ))}
</select>
<select value={year} onChange={(e) => setYear(Number(e.target.value))}>
{[year - 1, year, year + 1].map((y) => (
      <option key={y} value={y}>{y}</option>
                                ))}
</select>
      </div>

<form className="tx-form" onSubmit={handleSubmit}>
      <h3>Agregar movimiento</h3>
{error && <div className="error">{error}</div>}
 <div className="form-row">
      <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
      <input type="text" placeholder="Descripcion" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
      <input type="number" placeholder="Monto" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
      </div>
 <div className="form-row">
      <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
      <option value="EXPENSE">Gasto</option>
<option value="INCOME">Ingreso</option>
      </select>
<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
      <option value="">Auto-categorizar</option>
{Object.keys(CATEGORY_LABELS).map((key) => (
      <option key={key} value={key}>{categoryIcon(key)} {categoryLabel(key)}</option>
                                  ))}
</select>
<input type="text" placeholder="Comercio (opcional)" value={form.merchant} onChange={(e) => setForm({ ...form, merchant: e.target.value })} />
      </div>
<button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Agregar'}</button>
      </form>

{loading ? (
      <p>Cargando...</p>
      ) : items.length === 0 ? (
      <p className="hint">No hay movimientos este mes.</p>
 ) : (
       <table className="tx-table">
       <thead>
       <tr>
       <th>Fecha</th>
 <th>Descripcion</th>
 <th>Categoria</th>
 <th>Monto</th>
 <th></th>
       </tr>
       </thead>
 <tbody>
 {items.map((t) => (
       <tr key={t.id}>
<td>{formatDate(t.date)}</td>
            <td>{t.description}</td>
            <td>
       <span className="badge" style={{ background: categoryColor(t.category), color: '#0f172a' }}>
            {categoryIcon(t.category)} {categoryLabel(t.category)}
</span>
      </td>
<td className={t.amount < 0 ? 'neg' : 'pos'}>{formatCLP(t.amount)}</td>
<td><button className="delete-btn" onClick={() => handleDelete(t.id)}>Eliminar</button></td>
      </tr>
))}
      </tbody>
      </table>
)}
</div>
);
});
}
}
