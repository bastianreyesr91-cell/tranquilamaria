'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('demo@tranquilamaria.cl');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
                const res = await fetch('/api/auth/login', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email, password }),
                });
                const data = await res.json();
                if (!res.ok) {
                          setError(data.error || 'Error al iniciar sesion');
                          return;
                }
                router.push('/dashboard');
                router.refresh();
        } catch (err) {
                setError('Error de conexion');
        } finally {
                setLoading(false);
        }
  }

  return (
        <main className="login-page">
          <div className="login-card">
            <h1>Tranquilamaria</h1>
          <p className="subtitle">Control financiero personal</p>
          <form onSubmit={handleSubmit}>
              <label>
                Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
                  </label>
            <label>
                              Contrasena
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
                  </label>
  {error && <p className="error">{error}</p>}
             <button type="submit" disabled={loading}>
  {loading ? 'Ingresando...' : 'Ingresar'}
  </button>
    </form>
          <p className="hint">Usuario demo: demo@tranquilamaria.cl / Demo1234!</p>
    </div>
    </main>
    );
}
