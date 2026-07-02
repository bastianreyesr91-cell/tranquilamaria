'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Nav() {
    const pathname = usePathname();
    const router = useRouter();

  async function handleLogout() {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
  }

  const links = [
    { href: '/dashboard', label: 'Resumen' },
    { href: '/movimientos', label: 'Movimientos' },
    { href: '/importar', label: 'Importar' },
      ];

  return (
        <nav className="topnav">
          <span className="brand">Tranquilamaria</span>
        <div className="nav-links">
  {links.map((l) => (
              <Link key={l.href} href={l.href} className={pathname === l.href ? 'active' : ''}>
{l.label}
</Link>
        ))}
</div>
      <button className="logout" onClick={handleLogout}>Salir</button>
  </nav>
  );
}
