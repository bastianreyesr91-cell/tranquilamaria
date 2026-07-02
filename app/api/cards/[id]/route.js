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
    const { name, bank, lastFour, totalLimit, usedAmount, billingDay, paymentDay, color } = body;

  const supabase = getSupabase();
    const { data, error } = await supabase.rpc('update_card', {
          p_user_id: session.id,
          p_id: id,
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
        return NextResponse.json({ error: 'Error al actualizar tarjeta' }, { status: 500 });
  }

  if (!data || data.length === 0) {
        return NextResponse.json({ error: 'Tarjeta no encontrada' }, { status: 404 });
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
    const { data, error } = await supabase.rpc('delete_card', {
          p_user_id: session.id,
          p_id: id,
    });

  if (error) {
        return NextResponse.json({ error: 'Error al eliminar tarjeta' }, { status: 500 });
  }

  if (!data) {
        return NextResponse.json({ error: 'Tarjeta no encontrada' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
