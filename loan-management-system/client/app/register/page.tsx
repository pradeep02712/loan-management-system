'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { useAuth } from '@/lib/auth';
import { ApiClientError } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await register(form.fullName, form.email, form.password);
      router.push('/borrower');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Registration failed');
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
            <h1 className="text-2xl font-black">Borrower Registration</h1>
            <p className="mt-2 text-sm text-slate-600">Executive accounts are seeded by the backend script.</p>
          </div>
          {error ? <div className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{error}</div> : null}
          <div className="space-y-2">
            <label className="label">Full name</label>
            <input className="input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <label className="label">Email</label>
            <input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" required />
          </div>
          <div className="space-y-2">
            <label className="label">Password</label>
            <input className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" minLength={8} required />
          </div>
          <button className="btn-primary w-full" disabled={submitting}>{submitting ? 'Creating...' : 'Create account'}</button>
          <p className="text-center text-sm text-slate-600">
            Already registered? <Link className="font-semibold text-slate-900" href="/login">Login</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
