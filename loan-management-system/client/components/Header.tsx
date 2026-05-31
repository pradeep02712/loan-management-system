'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-black tracking-tight text-slate-900">
          LMS
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <span className="hidden text-slate-600 sm:inline">
                {user.fullName} • <span className="capitalize">{user.role}</span>
              </span>
              {user.role === 'borrower' ? <Link className="btn-secondary" href="/borrower">Portal</Link> : null}
              {user.role !== 'borrower' ? <Link className="btn-secondary" href="/dashboard">Dashboard</Link> : null}
              <button
                className="btn-primary"
                onClick={() => {
                  logout();
                  router.push('/login');
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="btn-secondary" href="/login">Login</Link>
              <Link className="btn-primary" href="/register">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
