import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../../lib/supabase';
import { getSessionUser } from '../../../../../lib/auth';

export async function POST(req, { params }) {
    const session = await getSessionUser();
    if (!session) {
          return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

  const { id } = params;
    const body = await req.json();
    const amount = Number(body.amount);

  if (!amount) {
        return NextResponse.json({ error: 'Monto invalido' }, { status: 400 });
  }

  const supabase = getSupabase();
    const { data, error } = await supabase.rpc('deposit_to_goal', {
          p_user_id: session.id,
          p_id: id,
          p_amount: amount,
    });

  if (error) {
        return NextResponse.json({ error: 'Error al abonar a la meta' }, { status: 500 });
  }

  if (!data || data.length === 0) {
        return NextResponse.json({ error: 'Meta no encontrada' }, { status: 404 });
  }

  return NextResponse.json(data[0]);
}
