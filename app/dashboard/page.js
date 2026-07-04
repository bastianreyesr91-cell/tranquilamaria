'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Nav from '../../components/Nav';
import { categoryIcon, categoryLabel, categoryColor } from '../../lib/categories';

export default function DashboardPage() {
      const router = useRouter();
      const [data, setData] = useState(null);
      const [error, setError] = useState('');

useEffect(() => {
      fetch('/api/dashboard')
      .then(async (res) => {
            if (res.status === 401) {
                  router.push('/login');
                  return;
            }
            const json = await res.json();
            if (!res.ok) {
                  setError(json.error || 'Error al cargar');
                  return;
            }
            setData(json);
      })
      .catch(() => setError('Error de conexion'));
}, [router]);

const formatCLP = (n) =>
      new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);

if (error) {
      return (
            <main className="center">
            <Nav />
            <p className="error">{error}</p>
            </main>
      );
}

if (!data) {
      return (
            <main className="center">
            <Nav />
            <p>Cargando...</p>
            </main>
      );
}

return (
      <main className="dashboard">
      <Nav />
      <h1>Hola, {data.name}</h1>

<div className="summary-cards">
      <div className="card income">
      <span>Ingresos</span>
      <strong>{formatCLP(data.income)}</strong>
      </div>
      <div className="card expense">
      <span>Gastos</span>
      <strong>{formatCLP(data.expense)}</strong>
      </div>
      <div className="card balance">
      <span>Balance</span>
      <strong>{formatCLP(data.income - data.expense)}</strong>
      </div>
      </div>

<div className="recent">
      <h2>Movimientos recientes</h2>
<ul>
{(data.recent || []).map((t) => (
      <li key={t.id}>
      <span>
      <span className="badge" style={{ background: categoryColor(t.category), color: '#0f172a' }}>
{categoryIcon(t.category)} {categoryLabel(t.category)}
</span>{' '}
{t.description}
</span>
<span className={t.amount < 0 ? 'neg' : 'pos'}>{formatCLP(t.amount)}</span>
      </li>
))}
</ul>
<Link href="/movimientos">Ver todos los movimientos</Link>
      </div>

<div className="quick-links">
      <Link href="/tarjetas">Tarjetas y creditos</Link>
<Link href="/presupuesto">Presupuesto y metas</Link>
<Link href="/perfil">Mi perfil</Link>
      </div>

<p className="notice">
      Tranquilamaria sigue creciendo: ya tienes movimientos, tarjetas y creditos, presupuesto con metas de ahorro proyectadas, y tu perfil financiero.
      Proximamente: educacion financiera y alertas automaticas.
      </p>
      </main>
);
}
