import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { getSessionUser } from '../../../../lib/auth';

export async function PUT(req, { params }) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

const { id } = params;
  const body = await req.json();
  const { name, bank, accountType, initialBalance, color } = body;

const supabase = getSupabase();
  const { data, error } = await supabase.rpc('update_account', {
    p_user_id: session.id,
    p_id: id,
    p_name: name,
    p_bank: bank || null,
    p_account_type: accountType || 'CORRIENTE',
    p_initial_balance: Number(initialBalance) || 0,
    p_color: color || null,
  });

if (error) {
  return NextResponse.json({ error: 'Error al actualizar cuenta' }, { status: 500 });
}

if (!data || data.length === 0) {
  return NextResponse.json({ error: 'Cuenta no encontrada' }, { status: 404 });
}

return NextResponse.json(data[0]);
}

export async function DELETE(req, { params }) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

const { id } = params;
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc('delete_account', {
    p_user_id: session.id,
    p_id: id,
  });

if (error) {
  return NextResponse.json({ error: 'Error al eliminar cuenta' }, { status: 500 });
}

if (!data) {
  return NextResponse.json({ error: 'Cuenta no encontrada' }, { status: 404 });
}

return NextResponse.json({ success: true });
}
