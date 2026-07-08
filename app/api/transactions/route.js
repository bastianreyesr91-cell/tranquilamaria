import { NextResponse } from 'next/server';
import { getSupabase } from '../../../lib/supabase';
import { getSessionUser } from '../../../lib/auth';

export async function GET(req) {
    const session = await getSessionUser();
    if (!session) {
        return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

const { searchParams } = new URL(req.url);
    const now = new Date();
    const month = Number(searchParams.get('month')) || now.getMonth() + 1;
    const year = Number(searchParams.get('year')) || now.getFullYear();

const supabase = getSupabase();
    const { data, error } = await supabase.rpc('list_transactions', {
        p_user_id: session.id,
        p_month: month,
        p_year: year,
    });

if (error) {
    return NextResponse.json({ error: 'Error al cargar movimientos' }, { status: 500 });
}

return NextResponse.json(data);
}

export async function POST(req) {
    const session = await getSessionUser();
    if (!session) {
        return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

const body = await req.json();
    const { date, description, amount, type, category, merchant, accountId, classification } = body;

if (!date || !description || amount === undefined || !type) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
}

const supabase = getSupabase();
    const { data, error } = await supabase.rpc('create_transaction', {
        p_user_id: session.id,
        p_date: date,
        p_description: description,
        p_amount: amount,
        p_type: type,
        p_category: category || null,
        p_merchant: merchant || null,
        p_account_id: accountId || null,
                        p_classification: classification || null,
    });

if (error) {
    return NextResponse.json({ error: 'Error al crear movimiento' }, { status: 500 });
}

return NextResponse.json(data[0]);
}
