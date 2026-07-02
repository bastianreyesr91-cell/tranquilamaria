'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '../../components/Nav';

function formatCLP(amount) {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount || 0);
}

const CREDIT_TYPE_LABELS = {
    HIPOTECARIO: 'Hipotecario',
    AUTOMOTRIZ: 'Automotriz',
    CONSUMO: 'Consumo',
    ESTUDIANTIL: 'Estudiantil',
    OTRO: 'Otro',
};

export default function TarjetasPage() {
    const router = useRouter();
    const [cards, setCards] = useState([]);
    const [credits, setCredits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

  const [cardForm, setCardForm] = useState({
        name: '', bank: '', lastFour: '', totalLimit: '', usedAmount: '', billingDay: '', paymentDay: '', color: '#4ade80',
  });
    const [savingCard, setSavingCard] = useState(false);

  const [creditForm, setCreditForm] = useState({
        name: '', bank: '', type: 'CONSUMO', originalAmount: '', currentBalance: '', monthlyPayment: '',
        interestRate: '', totalMonths: '', paidMonths: '', paymentDay: '', startDate: '', isUf: false,
  });
    const [savingCredit, setSavingCredit] = useState(false);

  async function load() {
        setLoading(true);
        setError('');
        try {
                const [cardsRes, creditsRes] = await Promise.all([
                          fetch('/api/cards'),
                          fetch('/api/credits'),
                        ]);
                if (cardsRes.status === 401 || creditsRes.status === 401) {
                          router.push('/login');
                          return;
                }
                const cardsData = await cardsRes.json();
                const creditsData = await creditsRes.json();
                setCards(Array.isArray(cardsData) ? cardsData : []);
                setCredits(Array.isArray(creditsData) ? creditsData : []);
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

  async function handleAddCard(e) {
        e.preventDefault();
        setSavingCard(true);
        setError('');
        try {
                const res = await fetch('/api/cards', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(cardForm),
                });
                const data = await res.json();
                if (!res.ok) {
                          setError(data.error || 'Error al crear tarjeta');
                } else {
                          setCardForm({ name: '', bank: '', lastFour: '', totalLimit: '', usedAmount: '', billingDay: '', paymentDay: '', color: '#4ade80' });
                          load();
                }
        } catch (e) {
                setError('Error de conexion');
        } finally {
                setSavingCard(false);
        }
  }

  async function handleDeleteCard(id) {
        if (!confirm('Eliminar esta tarjeta?')) return;
        const res = await fetch(`/api/cards/${id}`, { method: 'DELETE' });
        if (res.ok) {
                setCards((prev) => prev.filter((c) => c.id !== id));
        }
  }

  async function handleAddCredit(e) {
        e.preventDefault();
        setSavingCredit(true);
        setError('');
        try {
                const res = await fetch('/api/credits', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(creditForm),
                });
                const data = await res.json();
                if (!res.ok) {
                          setError(data.error || 'Error al crear credito');
                } else {
                          setCreditForm({
                                      name: '', bank: '', type: 'CONSUMO', originalAmount: '', currentBalance: '', monthlyPayment: '',
                                      interestRate: '', totalMonths: '', paidMonths: '', paymentDay: '', startDate: '', isUf: false,
                          });
                          load();
                }
        } catch (e) {
                setError('Error de conexion');
        } finally {
                setSavingCredit(false);
        }
  }

  async function handleDeleteCredit(id) {
        if (!confirm('Eliminar este credito?')) return;
        const res = await fetch(`/api/credits/${id}`, { method: 'DELETE' });
        if (res.ok) {
                setCredits((prev) => prev.filter((c) => c.id !== id));
        }
  }

  return (
        <div className="page">
          <Nav />
          <h1>Tarjetas y creditos</h1>
  {error && <div className="error">{error}</div>}

        <h2>Tarjetas de credito</h2>
   {loading ? (
             <p>Cargando...</p>
           ) : cards.length === 0 ? (
             <p className="hint">No tienes tarjetas registradas.</p>
          ) : (
                    <div className="card-grid">

            {cards.map((c) => {
                        const pct = c.total_limit > 0 ? Math.min(100, Math.round((c.used_amount / c.total_limit) * 100)) : 0;
                        return (
                                        <div key={c.id} className="credit-card-item" style={{ borderTop: `4px solid ${c.color || '#4ade80'}` }}>
                   <div className="credit-card-header">
                              <strong>{c.name}</strong>
                      <button className="delete-btn" onClick={() => handleDeleteCard(c.id)}>Eliminar</button>
     </div>
                   <p className="hint">{c.bank} {c.last_four ? `numero terminado en ${c.last_four}` : ''}</p>
                  <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%`, background: pct > 85 ? '#f87171' : '#4ade80' }} />
  </div>
                <p>{formatCLP(c.used_amount)} de {formatCLP(c.total_limit)} ({pct}%)</p>
                <p className="hint">Cierre dia {c.billing_day || '-'} - Pago dia {c.payment_day || '-'}</p>
  </div>
            );
})}
  </div>
      )}

      <form className="tx-form" onSubmit={handleAddCard}>
                <h3>Agregar tarjeta</h3>
        <div className="form-row">
                  <input type="text" placeholder="Nombre" value={cardForm.name} onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })} required />
                  <input type="text" placeholder="Banco" value={cardForm.bank} onChange={(e) => setCardForm({ ...cardForm, bank: e.target.value })} />
                  <input type="text" placeholder="Ultimos 4 digitos" maxLength={4} value={cardForm.lastFour} onChange={(e) => setCardForm({ ...cardForm, lastFour: e.target.value })} />
        </div>
        <div className="form-row">
                  <input type="number" placeholder="Cupo total" value={cardForm.totalLimit} onChange={(e) => setCardForm({ ...cardForm, totalLimit: e.target.value })} required />
                  <input type="number" placeholder="Monto usado" value={cardForm.usedAmount} onChange={(e) => setCardForm({ ...cardForm, usedAmount: e.target.value })} />
                  <input type="number" placeholder="Dia de cierre" min={1} max={31} value={cardForm.billingDay} onChange={(e) => setCardForm({ ...cardForm, billingDay: e.target.value })} />
                  <input type="number" placeholder="Dia de pago" min={1} max={31} value={cardForm.paymentDay} onChange={(e) => setCardForm({ ...cardForm, paymentDay: e.target.value })} />
        </div>
        <button type="submit" disabled={savingCard}>{savingCard ? 'Guardando...' : 'Agregar tarjeta'}</button>
        </form>

      <h2>Creditos</h2>
{loading ? (
          <p>Cargando...</p>
        ) : credits.length === 0 ? (
          <p className="hint">No tienes creditos registrados.</p>
       ) : (
                 <div className="card-grid">
         {credits.map((cr) => {
                     const pct = cr.total_months > 0 ? Math.min(100, Math.round((cr.paid_months / cr.total_months) * 100)) : 0;
                     return (
                                     <div key={cr.id} className="credit-card-item">
                         <div className="credit-card-header">
                           <strong>{cr.name}</strong>
                            <button className="delete-btn" onClick={() => handleDeleteCredit(cr.id)}>Eliminar</button>
         </div>
                 <p className="hint">{cr.bank} - {CREDIT_TYPE_LABELS[cr.type] || cr.type}</p>
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: '#60a5fa' }} />
  </div>
                <p>Saldo: {formatCLP(cr.current_balance)}</p>
                <p className="hint">Cuota mensual: {formatCLP(cr.monthly_payment)} - {cr.paid_months || 0}/{cr.total_months || 0} meses pagados</p>
  </div>
            );
})}
</div>
      )}

      <form className="tx-form" onSubmit={handleAddCredit}>
                <h3>Agregar credito</h3>
        <div className="form-row">
                  <input type="text" placeholder="Nombre" value={creditForm.name} onChange={(e) => setCreditForm({ ...creditForm, name: e.target.value })} required />
                  <input type="text" placeholder="Banco" value={creditForm.bank} onChange={(e) => setCreditForm({ ...creditForm, bank: e.target.value })} />
                  <select value={creditForm.type} onChange={(e) => setCreditForm({ ...creditForm, type: e.target.value })}>
      {Object.entries(CREDIT_TYPE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                                                          ))}
</select>
  </div>
        <div className="form-row">
            <input type="number" placeholder="Monto original" value={creditForm.originalAmount} onChange={(e) => setCreditForm({ ...creditForm, originalAmount: e.target.value })} required />
            <input type="number" placeholder="Saldo actual" value={creditForm.currentBalance} onChange={(e) => setCreditForm({ ...creditForm, currentBalance: e.target.value })} required />
            <input type="number" placeholder="Cuota mensual" value={creditForm.monthlyPayment} onChange={(e) => setCreditForm({ ...creditForm, monthlyPayment: e.target.value })} required />
            <input type="number" placeholder="Tasa interes %" value={creditForm.interestRate} onChange={(e) => setCreditForm({ ...creditForm, interestRate: e.target.value })} />
  </div>
        <div className="form-row">
            <input type="number" placeholder="Meses totales" value={creditForm.totalMonths} onChange={(e) => setCreditForm({ ...creditForm, totalMonths: e.target.value })} />
            <input type="number" placeholder="Meses pagados" value={creditForm.paidMonths} onChange={(e) => setCreditForm({ ...creditForm, paidMonths: e.target.value })} />
            <input type="number" placeholder="Dia de pago" min={1} max={31} value={creditForm.paymentDay} onChange={(e) => setCreditForm({ ...creditForm, paymentDay: e.target.value })} />
            <input type="date" value={creditForm.startDate} onChange={(e) => setCreditForm({ ...creditForm, startDate: e.target.value })} />
  </div>
        <label className="hint">
            <input type="checkbox" checked={creditForm.isUf} onChange={(e) => setCreditForm({ ...creditForm, isUf: e.target.checked })} /> Expresado en UF
  </label>
        <br />
          <button type="submit" disabled={savingCredit}>{savingCredit ? 'Guardando...' : 'Agregar credito'}</button>
  </form>
  </div>
  );
}
