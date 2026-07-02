import { cookies } from 'next/headers';
import { verifySession } from './session';

export async function getSessionUser() {
    const cookieStore = cookies();
    const token = cookieStore.get('tm_session')?.value;
    const session = await verifySession(token);
    return session;
}
