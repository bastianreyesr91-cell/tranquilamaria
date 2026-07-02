import { NextResponse } from 'next/server';
import { getSupabase } from '../../../lib/supabase';
import { getSessionUser } from '../../../lib/auth';

export async function GET(req) {
    const session = await getSessionUser();
    if (!session) {
          return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

  const { searchParams } = new URL(req.url);
    const now = new Date();
    const month = Number(searchParams.get('month')) || now.getMonth() + 1;
    const year = Number(searchParams.get('year')) || now.getFullYear();

  const supabase = getSupabase();
    const { data, error } = await supabase.rpc('get_budget_status', {
          p_user_id: session.id,
          p_month: month,
          p_year: year,
    });

  if (error) {
        return NextResponse.json({ error: 'Error al cargar presupuesto' }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req) {
    const session = await getSessionUser();
    if (!session) {
          return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

  const body = await req.json();
    const { category, amount, month, year } = body;

  if (!category || amount === undefined || !month || !year) {
        return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
  }

  const supabase = getSupabase();
    const { data, error } = await supabase.rpc('upsert_budget', {
          p_user_id: session.id,
          p_category: category,
          p_amount: Number(amount),
          p_month: Number(month),
          p_year: Number(year),
    });

  if (error) {
        return NextResponse.json({ error: 'Error al guardar presupuesto' }, { status: 500 });
  }

  return NextResponse.json(data[0]);
}
