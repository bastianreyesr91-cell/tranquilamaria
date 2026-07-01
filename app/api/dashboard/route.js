import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabase } from '../../../lib/supabase';
import { verifySession } from '../../../lib/session';

export async function GET() {
    const cookieStore = cookies();
    const token = cookieStore.get('tm_session')?.value;
    const session = await verifySession(token);
    if (!session) {
          return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

  const supabase = getSupabase();
    const { data, error } = await supabase.rpc('get_dashboard', { p_user_id: session.id });

  if (error || !data || data.length === 0) {
        return NextResponse.json({ error: 'Error al cargar datos' }, { status: 500 });
  }

  return NextResponse.json(data[0]);
}
