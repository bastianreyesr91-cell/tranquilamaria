import { NextResponse } from 'next/server';
import { getSupabase } from '../../../lib/supabase';
import { getSessionUser } from '../../../lib/auth';

export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

const supabase = getSupabase();
  const { data, error } = await supabase.rpc('get_cashflow_summary', {
    p_user_id: session.id,
    p_months: 6,
  });

if (error || !data || data.length === 0) {
  return NextResponse.json({ avg_income: 0, avg_expense: 0, months_counted: 0 });
}

return NextResponse.json(data[0]);
}
