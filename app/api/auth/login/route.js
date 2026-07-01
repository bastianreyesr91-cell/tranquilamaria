import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { signSession } from '../../../../lib/session';

export async function POST(req) {
    const { email, password } = await req.json();
    if (!email || !password) {
          return NextResponse.json({ error: 'Email y contrasena requeridos' }, { status: 400 });
    }

  const supabase = getSupabase();
    const { data, error } = await supabase.rpc('login_user', {
          p_email: email,
          p_password: password,
    });

  if (error || !data || data.length === 0) {
        return NextResponse.json({ error: 'Credenciales invalidas' }, { status: 401 });
  }

  const user = data[0];
    const token = await signSession({ id: user.id, email: user.email, name: user.name });

  const res = NextResponse.json({ user });
    res.cookies.set('tm_session', token, {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
    });
    return res;
}
