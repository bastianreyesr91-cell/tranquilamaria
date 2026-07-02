import { NextResponse } from 'next/server';
import { getSupabase } from '../../../lib/supabase';
import { getSessionUser } from '../../../lib/auth';

export async function GET() {
    const session = await getSessionUser();
    if (!session) {
          return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

  const supabase = getSupabase();
    const { data, error } = await supabase.rpc('get_goals', { p_user_id: session.id });

  if (error) {
        return NextResponse.json({ error: 'Error al cargar metas' }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req) {
    const session = await getSessionUser();
    if (!session) {
          return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

  const body = await req.json();
    const { name, emoji, targetAmount, currentAmount, monthlyTarget, deadline } = body;

  if (!name || !targetAmount) {
        return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
  }

  const supabase = getSupabase();
    const { data, error } = await supabase.rpc('create_goal', {
          p_user_id: session.id,
          p_name: name,
          p_emoji: emoji || null,
          p_target_amount: Number(targetAmount),
          p_current_amount: Number(currentAmount) || 0,
          p_monthly_target: monthlyTarget ? Number(monthlyTarget) : null,
          p_deadline: deadline || null,
    });

  if (error) {
        return NextResponse.json({ error: 'Error al crear meta' }, { status: 500 });
  }

  return NextResponse.json(data[0]);
}
