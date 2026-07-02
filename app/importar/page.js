'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '../../components/Nav';

function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) return [];

  const firstCols = lines[0].split(',').map((c) => c.trim().toLowerCase());
    const looksLikeHeader = firstCols.includes('date') || firstCols.includes('fecha');
    const dataLines = looksLikeHeader ? lines.slice(1) : lines;

  return dataLines.map((line) => {
        const cols = line.split(',').map((c) => c.trim());
        const [date, description, amount, merchant] = cols;
        return { date, description, amount, merchant: merchant || '' };
  });
}

export default function ImportarPage() {
    const router = useRouter();
    const [raw, setRaw] = useState('');
    const [rows, setRows] = useState([]);
    const [error, setError] = useState('');
    const [result, setResult] = useState('');
    const [importing, setImporting] = useState(false);

  function handleFile(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
                const text = String(reader.result || '');
                setRaw(text);
                setRows(parseCSV(text));
                setResult('');
                setError('');
        };
        reader.readAsText(file);
  }

  function handleParse() {
        setError('');
        setResult('');
        try {
                setRows(parseCSV(raw));
        } catch (e) {
                setError('No se pudo interpretar el texto pegado');
        }
  }

  async function handleImport() {
        setImporting(true);
        setError('');
        setResult('');
        try {
                const res = await fetch('/api/import', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ rows }),
                });
                if (res.status === 401) {
                          router.push('/login');
                          return;
                }
                const data = await res.json();
                if (!res.ok) {
                          setError(data.error || 'Error al importar');
                } else {
                          setResult(`Se importaron ${data.imported} movimientos correctamente.`);
                          setRows([]);
                          setRaw('');
                }
        } catch (e) {
                setError('Error de conexion');
        } finally {
                setImporting(false);
        }
  }

  return (
        <div className="page">
          <Nav />
          <h1>Importar cartola</h1>
        <p className="hint">
            Pega o sube un archivo CSV con columnas: fecha, descripcion, monto, comercio (opcional).
            Usa montos negativos para gastos y positivos para ingresos. Ejemplo: 2026-07-01,Jumbo Las Condes,-85000,Jumbo
    </p>

      <div className="import-controls">
            <input type="file" accept=".csv,.txt" onChange={handleFile} />
    </div>

      <textarea
          className="import-textarea"
          rows={8}
          placeholder="fecha,descripcion,monto,comercio"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
        />

                  <div className="import-actions">
            <button onClick={handleParse} type="button">Previsualizar</button>
          <button onClick={handleImport} type="button" disabled={rows.length === 0 || importing}>
{importing ? 'Importando...' : `Importar ${rows.length || ''} movimientos`}
</button>
  </div>

{error && <div className="error">{error}</div>}
 {result && <div className="notice">{result}</div>}

  {rows.length > 0 && (
            <table className="tx-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                 <th>Descripcion</th>
                 <th>Monto</th>
                 <th>Comercio</th>
    </tr>
    </thead>
             <tbody>
  {rows.map((r, i) => (
                  <tr key={i}>
                    <td>{r.date}</td>
                            <td>{r.description}</td>
                            <td>{r.amount}</td>
                            <td>{r.merchant}</td>
    </tr>
                        ))}
  </tbody>
    </table>
        )}
 </div>
   );
}
