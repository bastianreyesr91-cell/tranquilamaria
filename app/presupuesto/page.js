'use client';
import { useState, useEffect, useCallback } from 'react';
import Nav from '../../components/Nav';

const CATEGORY_LABELS = {
  VIVIENDA: 'Vivienda',
  SUPERMERCADO: 'Supermercado',
  COMIDA: 'Comida',
  DELIVERY: 'Delivery',
  TRANSPORTE: 'Transporte',
  COMBUSTIBLE: 'Combustible',
  EDUCACION: 'Educacion',
  SALUD: 'Salud',
  CREDITOS: 'Creditos',
  SERVICIOS_BASICOS: 'Servicios basicos',
  ENTRETENCION: 'Entretencion',
  SUSCRIPCIONES: 'Suscripciones',
  TRANSFERENCIAS: 'Transferencias',
  AHORRO: 'Ahorro',
  INVERSION: 'Inversion',
  SUELDO: 'Sueldo',
  OTROS: 'Otros',
};

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

function formatCLP(value) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value || 0);
}

export default function PresupuestoPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

const [newCategory, setNewCategory] = useState('SUPERMERCADO');
  const [newAmount, setNewAmount] = useState('');

const [goalName, setGoalName] = useState('');
  const [goalEmoji, setGoalEmoji] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalCurrent, setGoalCurrent] = useState('');
  const [goalMonthly, setGoalMonthly] = useState('');
  const [goalDeadline, setGoalDeadline] = useState('');

const [depositAmounts, setDepositAmounts] = useState({});

const loadData = useCallback(async () => {
  setLoading(true);
  setError('');
  try {
    const [budgetsRes, goalsRes] = await Promise.all([
      fetch(`/api/budgets?month=${month}&year=${year}`),
      fetch('/api/goals'),
      ]);
    const budgetsData = await budgetsRes.json();
    const goalsData = await goalsRes.json();
    setBudgets(Array.isArray(budgetsData) ? budgetsData : []);
    setGoals(Array.isArray(goalsData) ? goalsData : []);
  } catch (err) {
    setError('Error al cargar datos');
  } finally {
    setLoading(false);
  }
}, [month, year]);

useEffect(() => {
  loadData();
}, [loadData]);

async function handleAddBudget(e) {
  e.preventDefault();
  if (!newAmount) return;
  try {
    const res = await fetch('/api/budgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: newCategory, amount: Number(newAmount), month, year }),
    });
    if (!res.ok) throw new Error('fail');
    setNewAmount('');
    loadData();
  } catch (err) {
    setError('Error al guardar presupuesto');
  }
}

async function handleDeleteBudget(id) {
  if (!window.confirm('Eliminar este presupuesto?')) return;
  try {
    const res = await fetch(`/api/budgets/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('fail');
    loadData();
  } catch (err) {
    setError('Error al eliminar presupuesto');
  }
}

async function handleAddGoal(e) {
  e.preventDefault();
  if (!goalName || !goalTarget) return;
  try {
    const res = await fetch('/api/goals', {
  method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: goalName,
        emoji: goalEmoji || 'star',
        target_amount: Number(goalTarget),
        current_amount: Number(goalCurrent) || 0,
        monthly_target: Number(goalMonthly) || 0,
        deadline: goalDeadline || null,
      }),
    });
    if (!res.ok) throw new Error('fail');
    setGoalName('');
    setGoalEmoji('');
    setGoalTarget('');
    setGoalCurrent('');
    setGoalMonthly('');
    setGoalDeadline('');
    loadData();
  } catch (err) {
    setError('Error al crear meta');
  }
}

async function handleDeleteGoal(id) {
  if (!window.confirm('Eliminar esta meta?')) return;
  try {
    const res = await fetch(`/api/goals/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('fail');
    loadData();
  } catch (err) {
    setError('Error al eliminar meta');
  }
}

async function handleDeposit(id) {
  const amount = Number(depositAmounts[id]);
  if (!amount) return;
  try {
    const res = await fetch(`/api/goals/${id}/deposit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
    if (!res.ok) throw new Error('fail');
    setDepositAmounts((prev) => ({ ...prev, [id]: '' }));
    loadData();
  } catch (err) {
    setError('Error al abonar a la meta');
  }
}

const totalBudget = budgets.reduce((sum, b) => sum + Number(b.budget_amount || 0), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + Number(b.spent || 0), 0);

return (
  <div className="page">
  <Nav />
  <h1>Presupuesto y Metas de Ahorro</h1>
  {error && <p className="error-text">{error}</p>}

  <section>
    <h2>Presupuesto mensual</h2>
   <div className="month-selector">
    <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
  {MESES.map((m, i) => (
    <option key={m} value={i + 1}>{m}</option>
             ))}
  </select>
  <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
{[year - 1, year, year + 1].map((y) => (
  <option key={y} value={y}>{y}</option>
                                ))}
</select>
  </div>


<p>Total presupuestado: {formatCLP(totalBudget)} - Gastado: {formatCLP(totalSpent)}</p>

<form className="tx-form" onSubmit={handleAddBudget}>
  <div className="form-row">
  <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
{Object.entries(CATEGORY_LABELS).map(([key, label]) => (
  <option key={key} value={key}>{label}</option>
                                     ))}
</select>
<input
type="number"
placeholder="Monto presupuestado"
value={newAmount}
onChange={(e) => setNewAmount(e.target.value)}
/>
  <button type="submit">Guardar presupuesto</button>
  </div>
  </form>

{loading ? (
  <p>Cargando...</p>
  ) : (
  <div className="card-grid">
{budgets.map((b) => {
  const spent = Number(b.spent || 0);
  const amount = Number(b.budget_amount || 0);
  const pct = amount > 0 ? Math.min(100, Math.round((spent / amount) * 100)) : 0;
  return (
    <div className="credit-card-item" key={b.id}>
    <div className="credit-card-header">
    <span>{CATEGORY_LABELS[b.category] || b.category}</span>
             <button className="delete-btn" onClick={() => handleDeleteBudget(b.id)}>Eliminar</button>
  </div>
<p>{formatCLP(spent)} de {formatCLP(amount)}</p>
<div className="progress-bar">
  <div
className="progress-fill"
style={{ width: `${pct}%`, background: pct > 100 ? '#e53e3e' : undefined }}
/>
  </div>
  </div>
);
})}
{budgets.length === 0 && <p>No hay presupuestos para este mes.</p>}
  </div>
 )}
</section>


<section>
  <h2>Metas de ahorro</h2>

<form className="tx-form" onSubmit={handleAddGoal}>
  <div className="form-row">
  <input type="text" placeholder="Nombre de la meta" value={goalName} onChange={(e) => setGoalName(e.target.value)} />
<input type="text" placeholder="Emoji (opcional)" value={goalEmoji} onChange={(e) => setGoalEmoji(e.target.value)} />
<input type="number" placeholder="Monto objetivo" value={goalTarget} onChange={(e) => setGoalTarget(e.target.value)} />
  </div>
<div className="form-row">
  <input type="number" placeholder="Monto actual" value={goalCurrent} onChange={(e) => setGoalCurrent(e.target.value)} />
<input type="number" placeholder="Aporte mensual" value={goalMonthly} onChange={(e) => setGoalMonthly(e.target.value)} />
<input type="date" value={goalDeadline} onChange={(e) => setGoalDeadline(e.target.value)} />
<button type="submit">Crear meta</button>
  </div>
  </form>

{loading ? (
  <p>Cargando...</p>
  ) : (
  <div className="card-grid">
{goals.map((g) => {
  const target = Number(g.target_amount || 0);
  const current = Number(g.current_amount || 0);
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  return (
    <div className="credit-card-item" key={g.id}>
    <div className="credit-card-header">
    <span>{g.emoji} {g.name}</span>
 <button className="delete-btn" onClick={() => handleDeleteGoal(g.id)}>Eliminar</button>
  </div>
<p>{formatCLP(current)} de {formatCLP(target)} ({pct}%)</p>
<div className="progress-bar">
  <div className="progress-fill" style={{ width: `${pct}%` }} />
  </div>
{g.monthly_target > 0 && <p>Aporte mensual: {formatCLP(g.monthly_target)}</p>}
 {g.deadline && <p>Fecha objetivo: {g.deadline}</p>}
  <div className="form-row">
   <input
  type="number"
  placeholder="Monto a abonar"
  value={depositAmounts[g.id] || ''}
 onChange={(e) => setDepositAmounts((prev) => ({ ...prev, [g.id]: e.target.value }))}
 />
   <button onClick={() => handleDeposit(g.id)}>Abonar</button>
  </div>
  </div>
);
})}
{goals.length === 0 && <p>No hay metas creadas.</p>}
  </div>
 )}
</section>
  </div>
);
}
