'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import type { Role } from '@/lib/types';

export function Protected({ roles, children }: { roles?: Role[]; children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (roles?.length && !roles.includes(user.role)) {
      router.replace(user.role === 'borrower' ? '/borrower' : '/dashboard');
    }
  }, [loading, user, router, roles]);

  if (loading) return <div className="p-8 text-slate-600">Loading...</div>;
  if (!user) return null;
  if (roles?.length && !roles.includes(user.role)) return null;

  return <>{children}</>;
}
