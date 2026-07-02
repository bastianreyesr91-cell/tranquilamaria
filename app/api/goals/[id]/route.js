import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { getSessionUser } from '../../../../lib/auth';

export async function DELETE(req, { params }) {
    const session = await getSessionUser();
    if (!session) {
          return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

  const { id } = params;
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc('delete_goal', {
          p_user_id: session.id,
          p_id: id,
    });

  if (error) {
        return NextResponse.json({ error: 'Error al eliminar meta' }, { status: 500 });
  }

  if (!data) {
        return NextResponse.json({ error: 'Meta no encontrada' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
