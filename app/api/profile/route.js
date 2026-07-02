import { NextResponse } from 'next/server';
import { getSupabase } from '../../../lib/supabase';
import { getSessionUser } from '../../../lib/auth';

export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

const supabase = getSupabase();
  const { data, error } = await supabase.rpc('get_profile', {
    p_user_id: session.id,
  });

if (error || !data || data.length === 0) {
  return NextResponse.json({ error: 'Error al cargar perfil' }, { status: 500 });
}

return NextResponse.json(data[0]);
}

export async function PUT(req) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

const body = await req.json();
  const { name, rut, sexo, edad, ocupacion, tipo_ingresos, desafio_financiero } = body;

const supabase = getSupabase();
  const { data, error } = await supabase.rpc('update_profile', {
    p_user_id: session.id,
    p_name: name || null,
    p_rut: rut || null,
    p_sexo: sexo || null,
    p_edad: edad ? Number(edad) : null,
    p_ocupacion: ocupacion || null,
    p_tipo_ingresos: tipo_ingresos || null,
    p_desafio_financiero: desafio_financiero || null,
  });

if (error || !data || data.length === 0) {
  return NextResponse.json({ error: 'Error al guardar perfil' }, { status: 500 });
}

return NextResponse.json(data[0]);
}
