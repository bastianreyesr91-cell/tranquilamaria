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
    const { data, error } = await supabase.rpc('delete_transaction', {
          p_user_id: session.id,
          p_id: id,
    });

  if (error) {
        return NextResponse.json({ error: 'Error al eliminar movimiento' }, { status: 500 });
  }

  if (!data) {
        return NextResponse.json({ error: 'Movimiento no encontrado' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
