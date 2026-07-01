'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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

  async function handleLogout() {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
  }

  const formatCLP = (n) =>
        new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);

  if (error) return <main className="center"><p className="error">{error}</p></main>;
    if (!data) return <main className="center"><p>Cargando...</p></main>;

  return (
        <main className="dashboard">
          <header>
            <div>
              <h1>Hola, {data.name.split(' ')[0]}</h1>
          <p className="subtitle">{data.email}</p>
  </div>
        <button onClick={handleLogout} className="logout">Cerrar sesion</button>
  </header>

      <section className="summary-cards">
          <div className="card income">
            <span>Ingresos del mes</span>
          <strong>{formatCLP(data.income)}</strong>
  </div>
        <div className="card expense">
            <span>Gastos del mes</span>
          <strong>{formatCLP(data.expense)}</strong>
  </div>
        <div className="card balance">
            <span>Balance</span>
          <strong>{formatCLP(data.income - data.expense)}</strong>
  </div>
  </section>

      <section className="recent">
          <h2>Movimientos recientes</h2>
        <ul>
{data.recent.map((t, i) => (
              <li key={i}>
                <span>{t.description}</span>
                               <span className={t.amount < 0 ? 'neg' : 'pos'}>{formatCLP(t.amount)}</span>
                                 </li>
                                           ))}
</ul>
                                 </section>

                                       <p className="notice">
                                         Esta es una version inicial. Tarjetas, creditos, presupuestos y metas llegaran en la proxima etapa.
                                 </p>
                                 </main>
                                   );
                                 }
                                 
