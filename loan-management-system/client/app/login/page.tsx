'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { useAuth } from '@/lib/auth';
import { ApiClientError } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@lms.dev');
  const [password, setPassword] = useState('Password@123');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const user = await login(email, password);
      router.push(user.role === 'borrower' ? '/borrower' : '/dashboard');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      <Header />
      <section className="mx-auto max-w-md px-6 py-12">
        <form className="card space-y-5" onSubmit={onSubmit}>
          <div>
            <h1 className="text-2xl font-black">Login</h1>
            <p className="mt-2 text-sm text-slate-600">Use seeded credentials or your borrower account.</p>
          </div>
          {error ? <div className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{error}</div> : null}
          <div className="space-y-2">
            <label className="label">Email</label>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </div>
          <div className="space-y-2">
            <label className="label">Password</label>
            <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          </div>
          <button className="btn-primary w-full" disabled={submitting}>{submitting ? 'Signing in...' : 'Login'}</button>
          <p className="text-center text-sm text-slate-600">
            New borrower? <Link className="font-semibold text-slate-900" href="/register">Create account</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
