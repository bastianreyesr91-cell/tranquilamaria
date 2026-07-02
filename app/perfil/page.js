'use client';
import { useState, useEffect } from 'react';
import Nav from '../../components/Nav';

const SEXO_OPTIONS = ['Femenino', 'Masculino', 'Otro', 'Prefiero no decir'];
const TIPO_INGRESOS_OPTIONS = ['Dependiente', 'Independiente', 'Mixto', 'Pensionado', 'Otro'];
const DESAFIO_OPTIONS = [
  'Salir de deudas',
  'Crear fondo de emergencia',
  'Ahorrar para vivienda',
  'Ahorrar para educacion',
  'Planificar jubilacion',
  'Mejorar control de gastos',
  'Otro',
  ];

export default function PerfilPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rut, setRut] = useState('');
  const [sexo, setSexo] = useState('');
  const [edad, setEdad] = useState('');
  const [ocupacion, setOcupacion] = useState('');
  const [tipoIngresos, setTipoIngresos] = useState('');
  const [desafioSeleccionado, setDesafioSeleccionado] = useState('');
  const [desafioTexto, setDesafioTexto] = useState('');

useEffect(() => {
  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/profile');
      const data = await res.json();
      if (res.ok) {
        setName(data.name || '');
        setEmail(data.email || '');
        setRut(data.rut || '');
        setSexo(data.sexo || '');
        setEdad(data.edad || '');
        setOcupacion(data.ocupacion || '');
        setTipoIngresos(data.tipo_ingresos || '');
        const savedDesafio = data.desafio_financiero || '';
        if (savedDesafio && DESAFIO_OPTIONS.includes(savedDesafio)) {
          setDesafioSeleccionado(savedDesafio);
        } else if (savedDesafio) {
          setDesafioSeleccionado('Otro');
          setDesafioTexto(savedDesafio);
        }
      }
    } catch (err) {
      setError('Error al cargar perfil');
    } finally {
      setLoading(false);
    }
  }
  load();
}, []);

async function handleSubmit(e) {
  e.preventDefault();
  setSaving(true);
  setError('');
  setSuccess('');
  try {
    const desafioFinal = desafioSeleccionado === 'Otro' ? desafioTexto : desafioSeleccionado;
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        rut,
        sexo,
        edad,
        ocupacion,
        tipo_ingresos: tipoIngresos,
        desafio_financiero: desafioFinal,
      }),
    });
    if (!res.ok) throw new Error('fail');
    setSuccess('Perfil guardado correctamente');
  } catch (err) {
    setError('Error al guardar perfil');
  } finally {
    setSaving(false);
  }
}

         const initial = name ? name.charAt(0).toUpperCase() : '?';

return (
  <div className="page">
  <Nav />
  <div className="profile-header">
  <div className="avatar-circle">{initial}</div>
  <div>
  <h1>Mi Perfil</h1>
  <p className="subtitle">{email}</p>
  </div>
  </div>

  {error && <p className="error-text">{error}</p>}
   {success && <p className="success-text">{success}</p>}

    {loading ? (
      <p>Cargando...</p>
      ) : (
      <form className="tx-form profile-form" onSubmit={handleSubmit}>
      <div className="form-row">
      <label className="field">
      <span>Nombre completo</span>
     <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </label>
    <label className="field">
      <span>RUT</span>
    <input type="text" placeholder="12.345.678-9" value={rut} onChange={(e) => setRut(e.target.value)} />
     </label>
     </div>

  <div className="form-row">
     <label className="field">
     <span>Sexo</span>
   <select value={sexo} onChange={(e) => setSexo(e.target.value)}>
<option value="">Seleccionar</option>
    {SEXO_OPTIONS.map((o) => (
      <option key={o} value={o}>{o}</option>
                      ))}
  </select>
                                   </label>
  <label className="field">
    <span>Edad</span>
  <input type="number" value={edad} onChange={(e) => setEdad(e.target.value)} />
  </label>
  </div>


<div className="form-row">
  <label className="field">
  <span>Ocupacion / trabajo</span>
<input type="text" value={ocupacion} onChange={(e) => setOcupacion(e.target.value)} />
  </label>
<label className="field">
  <span>Tipo de ingresos</span>
<select value={tipoIngresos} onChange={(e) => setTipoIngresos(e.target.value)}>
<option value="">Seleccionar</option>
{TIPO_INGRESOS_OPTIONS.map((o) => (
  <option key={o} value={o}>{o}</option>
                           ))}
</select>
  </label>
  </div>

<div className="form-row">
  <label className="field field-wide">
  <span>Desafio financiero que esperas lograr</span>
<select value={desafioSeleccionado} onChange={(e) => setDesafioSeleccionado(e.target.value)}>
<option value="">Seleccionar</option>
{DESAFIO_OPTIONS.map((o) => (
  <option key={o} value={o}>{o}</option>
                     ))}
</select>
  </label>
  </div>

{desafioSeleccionado === 'Otro' && (
  <div className="form-row">
  <label className="field field-wide">
  <span>Cuentanos mas</span>
 <textarea
 rows={3}
 value={desafioTexto}
 onChange={(e) => setDesafioTexto(e.target.value)}
 placeholder="Describe tu desafio financiero"
 />
   </label>
   </div>
 )}

<button type="submit" disabled={saving}>
{saving ? 'Guardando...' : 'Guardar perfil'}
</button>
  </form>
)}
</div>
);
}
