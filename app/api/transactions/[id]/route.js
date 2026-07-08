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

export async function PUT(req, { params }) {
    const session = await getSessionUser();
    if (!session) {
        return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

const { id } = params;
    const body = await req.json();
            const { date, description, amount, type, category, merchant, accountId, classification } = body;

if (!date || !description || amount === undefined || amount === null || !type) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
}

const supabase = getSupabase();
    const { data, error } = await supabase.rpc('update_transaction', {
        p_user_id: session.id,
        p_id: id,
        p_date: date,
        p_description: description,
        p_amount: amount,
        p_type: type,
        p_category: category || '',
        p_merchant: merchant || null,
        p_account_id: accountId || null,
                p_classification: classification || null,
    });

if (error) {
    return NextResponse.json({ error: 'Error al actualizar movimiento' }, { status: 500 });
}

if (!data || data.length === 0) {
    return NextResponse.json({ error: 'Movimiento no encontrado' }, { status: 404 });
}

return NextResponse.json(data[0]);
}
