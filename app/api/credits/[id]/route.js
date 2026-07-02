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
    const {
          name, bank, type, originalAmount, currentBalance, monthlyPayment,
          interestRate, totalMonths, paidMonths, paymentDay, startDate, isUf,
    } = body;

  const supabase = getSupabase();
    const { data, error } = await supabase.rpc('update_credit', {
          p_user_id: session.id,
          p_id: id,
          p_name: name,
          p_bank: bank || null,
          p_type: type || 'CONSUMO',
          p_original_amount: Number(originalAmount) || 0,
          p_current_balance: Number(currentBalance) || 0,
          p_monthly_payment: Number(monthlyPayment) || 0,
          p_interest_rate: interestRate ? Number(interestRate) : null,
          p_total_months: totalMonths ? Number(totalMonths) : null,
          p_paid_months: paidMonths ? Number(paidMonths) : 0,
          p_payment_day: paymentDay ? Number(paymentDay) : null,
          p_start_date: startDate || null,
          p_is_uf: Boolean(isUf),
    });

  if (error) {
        return NextResponse.json({ error: 'Error al actualizar credito' }, { status: 500 });
  }

  if (!data || data.length === 0) {
        return NextResponse.json({ error: 'Credito no encontrado' }, { status: 404 });
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
    const { data, error } = await supabase.rpc('delete_credit', {
          p_user_id: session.id,
          p_id: id,
    });

  if (error) {
        return NextResponse.json({ error: 'Error al eliminar credito' }, { status: 500 });
  }

  if (!data) {
        return NextResponse.json({ error: 'Credito no encontrado' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
