import { NextResponse } from 'next/server';
import { verifySession } from './lib/session';

export async function middleware(req) {
    const token = req.cookies.get('tm_session')?.value;
    const session = await verifySession(token);

  if (req.nextUrl.pathname.startsWith('/dashboard') && !session) {
        return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*'],
};
