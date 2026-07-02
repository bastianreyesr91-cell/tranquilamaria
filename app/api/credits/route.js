import { NextResponse } from 'next/server';
import { getSupabase } from '../../../lib/supabase';
import { getSessionUser } from '../../../lib/auth';

export async function GET() {
    const session = await getSessionUser();
    if (!session) {
          return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

  const supabase = getSupabase();
    const { data, error } = await supabase.rpc('get_credits', { p_user_id: session.id });

  if (error) {
        return NextResponse.json({ error: 'Error al cargar creditos' }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req) {
    const session = await getSessionUser();
    if (!session) {
          return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

  const body = await req.json();
    const {
          name, bank, type, originalAmount, currentBalance, monthlyPayment,
          interestRate, totalMonths, paidMonths, paymentDay, startDate, isUf,
    } = body;

  if (!name) {
        return NextResponse.json({ error: 'Falta el nombre del credito' }, { status: 400 });
  }

  const supabase = getSupabase();
    const { data, error } = await supabase.rpc('create_credit', {
          p_user_id: session.id,
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
        return NextResponse.json({ error: 'Error al crear credito' }, { status: 500 });
  }

  return NextResponse.json(data[0]);
}
