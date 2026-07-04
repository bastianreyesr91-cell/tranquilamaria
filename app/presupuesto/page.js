'use client';
import { useState, useEffect, useCallback } from 'react';
import Nav from '../../components/Nav';
import { categoryIcon, categoryLabel, categoryColor, HORIZONTE_INFO, classifyHorizonte } from '../../lib/categories';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

function formatCLP(value) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value || 0);
}

function BarChart({ items }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="bar-chart">
  {items.map((i) => (
    <div className="bar-chart-row" key={i.key}>
<div className="bar-chart-label">
    <span>{i.icon}</span>
  <span>{i.label}</span>
    </div>
  <div className="bar-chart-track">
    <div
  className="bar-chart-fill"
  style={{ width: `${Math.round((i.value / max) * 100)}%`, background: i.color }}
/>
  </div>
<div className="bar-chart-value">{formatCLP(i.value)}</div>
  </div>
))}
{items.length === 0 && <p>Sin gastos registrados este mes.</p>}
  </div>
 );
}

export default function PresupuestoPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [cashflow, setCashflow] = useState({ avg_income: 0, avg_expense: 0, months_counted: 0 });
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
    const [budgetsRes, goalsRes, cashflowRes] = await Promise.all([
      fetch(`/api/budgets?month=${month}&year=${year}`),
      fetch('/api/goals'),
      fetch('/api/cashflow'),
      ]);
    const budgetsData = await budgetsRes.json();
    const goalsData = await goalsRes.json();
    const cashflowData = await cashflowRes.json();
    setBudgets(Array.isArray(budgetsData) ? budgetsData : []);
    setGoals(Array.isArray(goalsData) ? goalsData : []);
    setCashflow(cashflowData || { avg_income: 0, avg_expense: 0, months_counted: 0 });
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
  const disponible = Number(cashflow.avg_income || 0) - Number(cashflow.avg_expense || 0);
  const totalMonthlyGoals = goals.reduce((sum, g) => sum + Number(g.monthly_target || 0), 0);
  const sobreComprometido = cashflow.months_counted > 0 && totalMonthlyGoals > disponible;

const chartItems = budgets
  .filter((b) => Number(b.spent || 0) > 0)
  .sort((a, b) => Number(b.spent || 0) - Number(a.spent || 0))
  .map((b) => ({
    key: b.id,
    label: categoryLabel(b.category),
    icon: categoryIcon(b.category),
    color: categoryColor(b.category),
    value: Number(b.spent || 0),
  }));

return (
  <div className="page">
  <Nav />
  <h1>Presupuesto y Metas de Ahorro</h1>
  {error && <p className="error-text">{error}</p>}

  <section className="finance-summary">
    <h2>Tu flujo financiero real</h2>
   <p>
    Ingreso promedio: {formatCLP(cashflow.avg_income)} · Gasto promedio: {formatCLP(cashflow.avg_expense)} · Disponible para ahorrar: {formatCLP(disponible)}
   </p>
   {cashflow.months_counted === 0 && (
     <p className="hint-text">Aun no hay suficiente historial de movimientos para calcular tu flujo real.</p>
    )}
   {sobreComprometido && (
     <p className="error-text">
     Tus aportes mensuales a metas ({formatCLP(totalMonthlyGoals)}) superan tu disponible real. Considera ajustarlos.
     </p>
    )}
   </section>

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

<h3>Gastos por categoria</h3>
<BarChart items={chartItems} />

  <form className="tx-form" onSubmit={handleAddBudget}>
  <div className="form-row">
  <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
{Object.keys(HORIZONTE_INFO).length && null}
{['VIVIENDA','SUPERMERCADO','COMIDA','DELIVERY','TRANSPORTE','COMBUSTIBLE','EDUCACION','SALUD','CREDITOS','SERVICIOS_BASICOS','ENTRETENCION','SUSCRIPCIONES','TRANSFERENCIAS','AHORRO','INVERSION','SUELDO','OTROS'].map((key) => (
  <option key={key} value={key}>{categoryIcon(key)} {categoryLabel(key)}</option>
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
    <div className="credit-card-item" key={b.id} style={{ borderLeft: `4px solid ${categoryColor(b.category)}` }}>
             <div className="credit-card-header">
             <span>{categoryIcon(b.category)} {categoryLabel(b.category)}</span>
<button className="delete-btn" onClick={() => handleDeleteBudget(b.id)}>Eliminar</button>
  </div>
<p>{formatCLP(spent)} de {formatCLP(amount)}</p>
<div className="progress-bar">
  <div
className="progress-fill"
style={{ width: `${pct}%`, background: pct > 100 ? '#e53e3e' : categoryColor(b.category) }}
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
    const monthly = Number(g.monthly_target || 0);
    const remaining = Math.max(0, target - current);
    const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
    const months = monthly > 0 ? Math.ceil(remaining / monthly) : null;
    const horizonteKey = classifyHorizonte(months);
    const horizonte = HORIZONTE_INFO[horizonteKey];
    return (
      <div className="credit-card-item" key={g.id} style={{ borderLeft: `4px solid ${horizonte.color}` }}>
             <div className="credit-card-header">
             <span>{g.emoji} {g.name}</span>
<button className="delete-btn" onClick={() => handleDeleteGoal(g.id)}>Eliminar</button>
    </div>
<span className="badge" style={{ background: horizonte.color, color: '#0f172a' }}>{horizonte.label}</span>
<p>{formatCLP(current)} de {formatCLP(target)} ({pct}%)</p>
<div className="progress-bar">
    <div className="progress-fill" style={{ width: `${pct}%`, background: horizonte.color }} />
    </div>
{monthly > 0 ? (
  <p>Aporte mensual: {formatCLP(monthly)} · Estimado: {months} {months === 1 ? 'mes' : 'meses'}</p>
 ) : (
   <p className="hint-text">Define un aporte mensual para proyectar cuando la alcanzaras.</p>
   )}
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

   }
           
