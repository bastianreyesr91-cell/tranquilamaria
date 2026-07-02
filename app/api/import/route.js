import { NextResponse } from 'next/server';
import { getSupabase } from '../../../lib/supabase';
import { getSessionUser } from '../../../lib/auth';

export async function POST(req) {
    const session = await getSessionUser();
    if (!session) {
          return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

  const body = await req.json();
    const rows = body?.rows;

  if (!Array.isArray(rows) || rows.length === 0) {
        return NextResponse.json({ error: 'No hay filas para importar' }, { status: 400 });
  }

  const cleanRows = rows
      .filter((r) => r.date && r.description && r.amount !== undefined && r.amount !== '')
      .map((r) => ({
              date: r.date,
              description: String(r.description).slice(0, 255),
              amount: Number(r.amount),
              merchant: r.merchant || null,
      }))
      .filter((r) => !Number.isNaN(r.amount));

  if (cleanRows.length === 0) {
        return NextResponse.json({ error: 'Ninguna fila es valida' }, { status: 400 });
  }

  const supabase = getSupabase();
    const { data, error } = await supabase.rpc('import_transactions', {
          p_user_id: session.id,
          p_rows: cleanRows,
    });

  if (error) {
        return NextResponse.json({ error: 'Error al importar movimientos' }, { status: 500 });
  }

  return NextResponse.json({ imported: data });
}
