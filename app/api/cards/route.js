import { NextResponse } from 'next/server';
import { getSupabase } from '../../../lib/supabase';
import { getSessionUser } from '../../../lib/auth';

export async function GET() {
    const session = await getSessionUser();
    if (!session) {
          return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

  const supabase = getSupabase();
    const { data, error } = await supabase.rpc('get_cards', { p_user_id: session.id });

  if (error) {
        return NextResponse.json({ error: 'Error al cargar tarjetas' }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req) {
    const session = await getSessionUser();
    if (!session) {
          return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

  const body = await req.json();
    const { name, bank, lastFour, totalLimit, usedAmount, billingDay, paymentDay, color } = body;

  if (!name) {
        return NextResponse.json({ error: 'Falta el nombre de la tarjeta' }, { status: 400 });
  }

  const supabase = getSupabase();
    const { data, error } = await supabase.rpc('create_card', {
          p_user_id: session.id,
          p_name: name,
          p_bank: bank || null,
          p_last_four: lastFour || null,
          p_total_limit: Number(totalLimit) || 0,
          p_used_amount: Number(usedAmount) || 0,
          p_billing_day: billingDay ? Number(billingDay) : null,
          p_payment_day: paymentDay ? Number(paymentDay) : null,
          p_color: color || null,
    });

  if (error) {
        return NextResponse.json({ error: 'Error al crear tarjeta' }, { status: 500 });
  }

  return NextResponse.json(data[0]);
}
