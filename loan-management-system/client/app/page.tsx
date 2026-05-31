import Link from 'next/link';
import { Header } from '@/components/Header';

export default function HomePage() {
  return (
    <main>
      <Header />
      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-slate-500">Loan Management System</p>
          <h1 className="text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
            Borrower journey and operations dashboard in one clean platform.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Apply for short-term loans, run server-side eligibility checks, manage sanctioning, disbursement and collections with role-based access.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" className="btn-primary">Start borrower application</Link>
            <Link href="/login" className="btn-secondary">Executive login</Link>
          </div>
        </div>
        <div className="card">
          <h2 className="text-xl font-bold">Workflow</h2>
          <div className="mt-6 grid gap-3">
            {['Sign up / Login', 'Personal details + BRE', 'Salary slip upload', 'Loan config + apply', 'Sanction', 'Disbursement', 'Collection', 'Closed'].map((item, index) => (
              <div key={item} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-900 text-sm font-bold text-white">{index + 1}</span>
                <span className="font-semibold text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
