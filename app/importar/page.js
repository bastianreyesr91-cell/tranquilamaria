'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
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

function normalize(s) {
    return String(s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

function excelSerialToISO(serial) {
    const utcDays = Math.floor(serial - 25569);
    const utcValue = utcDays * 86400;
    const d = new Date(utcValue * 1000);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function toISODate(val) {
    if (typeof val === 'number') return excelSerialToISO(val);
    const str = String(val || '').trim();
    let m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m) {
        const [, mm, dd, yyyy] = m;
        return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
    }
    m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/);
    if (m) {
        const [, mm, dd, yy] = m;
        return `20${yy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
    }
    return str;
}

function isDateLike(val) {
    if (typeof val === 'number') return val > 20000 && val < 60000;
    const str = String(val || '').trim();
    return /^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(str);
}

function parseMonto(val) {
    if (typeof val === 'number') return val;
    const str = String(val || '').replace(/[^0-9.,-]/g, '').trim();
    if (!str) return NaN;
    const cleaned = str.replace(/,/g, '');
    return parseFloat(cleaned);
}

function parseEstadoCuenta(matrix) {
    let headerIdx = -1;
    let colFecha = -1;
    let colDesc = -1;
    let colMonto = -1;
    const colLugar = 0;

for (let i = 0; i < matrix.length; i++) {
    const row = matrix[i] || [];
    const norm = row.map(normalize);
    const fechaIdx = norm.findIndex((c) => c.includes('fecha') && c.includes('operaci'));
    const descIdx = norm.findIndex((c) => c.includes('descripci'));
    const montoIdx = norm.findIndex((c) => c.includes('monto') && c.includes('operaci'));
    if (fechaIdx !== -1 && descIdx !== -1 && montoIdx !== -1) {
        headerIdx = i;
        colFecha = fechaIdx;
        colDesc = descIdx;
        colMonto = montoIdx;
        break;
    }
}

if (headerIdx === -1) return [];

const rows = [];

for (let i = headerIdx + 1; i < matrix.length; i++) {
    const row = matrix[i] || [];
    if (row.every((c) => !String(c || '').trim())) continue;

    const first = String(row[0] || '').trim();
    if (/^\d+\./.test(first)) {
        if (first.startsWith('4.')) break;
        continue;
    }

    const fechaVal = row[colFecha];
    const desc = String(row[colDesc] || '').trim();

    if (!isDateLike(fechaVal) || !desc) continue;
    if (normalize(desc) === 'monto cancelado') continue;

    const amount = parseMonto(row[colMonto]);
    if (Number.isNaN(amount)) continue;

    const lugar = String(row[colLugar] || '').trim();
    rows.push({
        date: toISODate(fechaVal),
        description: desc,
        amount: String(-Math.abs(amount)),
        merchant: lugar,
    });
}

return rows;
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
    const name = file.name.toLowerCase();

    if (name.endsWith('.xls') || name.endsWith('.xlsx')) {
        setError('');
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const data = new Uint8Array(reader.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true, defval: '' });
                const parsed = parseEstadoCuenta(matrix);
                if (parsed.length === 0) {
                    setError('No se encontraron movimientos reconocibles en este archivo. Revisa que sea un estado de cuenta con el detalle de operaciones.');
                }
                setRaw('');
                setRows(parsed);
                setResult('');
            } catch (err) {
                setError('No se pudo leer el archivo Excel');
            }
        };
        reader.readAsArrayBuffer(file);
        return;
    }

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
    <br />
    Tambien puedes subir un estado de cuenta de tarjeta de credito en Excel (.xls o .xlsx): se extraen automaticamente los movimientos del periodo, excluyendo pagos y duplicados de cuotas.
    </p>

<div className="import-controls">
    <input type="file" accept=".csv,.txt,.xls,.xlsx" onChange={handleFile} />
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
