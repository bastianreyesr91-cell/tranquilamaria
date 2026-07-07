import { NextResponse } from 'next/server';
import { getSupabase } from '../../../lib/supabase';
import { getSessionUser } from '../../../lib/auth';

export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

const supabase = getSupabase();
  const { data, error } = await supabase.rpc('list_accounts', { p_user_id: session.id });

if (error) {
  return NextResponse.json({ error: 'Error al cargar cuentas' }, { status: 500 });
}

return NextResponse.json(data);
}

export async function POST(req) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

const body = await req.json();
  const { name, bank, accountType, initialBalance, color } = body;

if (!name) {
  return NextResponse.json({ error: 'Falta el nombre de la cuenta' }, { status: 400 });
}

const supabase = getSupabase();
  const { data, error } = await supabase.rpc('create_account', {
    p_user_id: session.id,
    p_name: name,
    p_bank: bank || null,
    p_account_type: accountType || 'CORRIENTE',
    p_initial_balance: Number(initialBalance) || 0,
    p_color: color || null,
  });

if (error) {
  return NextResponse.json({ error: 'Error al crear cuenta' }, { status: 500 });
}

return NextResponse.json(data[0]);
}
