'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Header } from '@/components/Header';
import { Protected } from '@/components/Protected';
import { api, ApiClientError, fileUrl } from '@/lib/api';
import { calculateLoan, formatINR } from '@/lib/money';
import type { Application, Loan, Payment } from '@/lib/types';

type BorrowerState = {
  application: Application | null;
  loan: Loan | null;
  payments: Payment[];
};

export default function BorrowerPage() {
  return (
    <Protected roles={['borrower']}>
      <BorrowerPortal />
    </Protected>
  );
}

function BorrowerPortal() {
  const [state, setState] = useState<BorrowerState>({ application: null, loan: null, payments: [] });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [personal, setPersonal] = useState({
    fullName: '',
    pan: '',
    dateOfBirth: '',
    monthlySalary: 25000,
    employmentMode: 'salaried'
  });
  const [salarySlip, setSalarySlip] = useState<File | null>(null);
  const [amount, setAmount] = useState(50000);
  const [tenureDays, setTenureDays] = useState(30);
  const calculation = useMemo(() => calculateLoan(amount, tenureDays), [amount, tenureDays]);

  async function load() {
    const data = await api<BorrowerState>('/borrower/application');
    setState(data);
    if (data.application) {
      setPersonal({
        fullName: data.application.fullName ?? '',
        pan: data.application.pan ?? '',
        dateOfBirth: data.application.dateOfBirth?.slice(0, 10) ?? '',
        monthlySalary: data.application.monthlySalary ?? 25000,
        employmentMode: data.application.employmentMode ?? 'salaried'
      });
    }
  }

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  function handleApiError(err: unknown) {
    if (err instanceof ApiClientError) {
      const details = err.details as { failures?: Array<{ message: string }> } | undefined;
      setError(details?.failures?.map((failure) => failure.message).join(' ') || err.message);
    } else {
      setError('Something went wrong');
    }
  }

  async function submitPersonal(event: FormEvent) {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      await api('/borrower/application/personal', {
        method: 'POST',
        body: JSON.stringify(personal)
      });
      setMessage('BRE passed. You can upload your salary slip now.');
      await load();
    } catch (err) {
      handleApiError(err);
      await load().catch(() => undefined);
    }
  }

  async function submitSlip(event: FormEvent) {
    event.preventDefault();
    if (!salarySlip) return;
    setError('');
    setMessage('');
    try {
      const formData = new FormData();
      formData.append('salarySlip', salarySlip);
      await api('/borrower/application/salary-slip', { method: 'POST', body: formData });
      setMessage('Salary slip uploaded successfully.');
      await load();
    } catch (err) {
      handleApiError(err);
    }
  }

  async function apply(event: FormEvent) {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      await api('/borrower/loans/apply', {
        method: 'POST',
        body: JSON.stringify({ amount, tenureDays })
      });
      setMessage('Loan application submitted. Status: APPLIED.');
      await load();
    } catch (err) {
      handleApiError(err);
    }
  }

  return (
    <main>
      <Header />
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Borrower Portal</p>
            <h1 className="mt-2 text-3xl font-black">Loan application</h1>
          </div>
          {state.loan ? <StatusBadge status={state.loan.status} /> : <StatusBadge status={state.application?.status ?? 'DRAFT'} />}
        </div>

        {message ? <div className="mb-6 rounded-xl bg-emerald-50 p-4 font-medium text-emerald-700">{message}</div> : null}
        {error ? <div className="mb-6 rounded-xl bg-red-50 p-4 font-medium text-red-700">{error}</div> : null}

        <div className="grid gap-6 lg:grid-cols-3">
          <form className="card space-y-4" onSubmit={submitPersonal}>
            <h2 className="text-xl font-bold">1. Personal details + BRE</h2>
            <Field label="Full name"><input className="input" value={personal.fullName} onChange={(e) => setPersonal({ ...personal, fullName: e.target.value })} required /></Field>
            <Field label="PAN"><input className="input uppercase" value={personal.pan} onChange={(e) => setPersonal({ ...personal, pan: e.target.value.toUpperCase() })} maxLength={10} required /></Field>
            <Field label="Date of birth"><input className="input" type="date" value={personal.dateOfBirth} onChange={(e) => setPersonal({ ...personal, dateOfBirth: e.target.value })} required /></Field>
            <Field label="Monthly salary"><input className="input" type="number" min="0" value={personal.monthlySalary} onChange={(e) => setPersonal({ ...personal, monthlySalary: Number(e.target.value) })} required /></Field>
            <Field label="Employment mode">
              <select className="input" value={personal.employmentMode} onChange={(e) => setPersonal({ ...personal, employmentMode: e.target.value })}>
                <option value="salaried">Salaried</option>
                <option value="self-employed">Self-Employed</option>
                <option value="unemployed">Unemployed</option>
              </select>
            </Field>
            <button className="btn-primary w-full">Run eligibility check</button>
            {state.application?.breFailures?.length ? (
              <ul className="space-y-2 text-sm text-red-700">
                {state.application.breFailures.map((failure) => <li key={failure.rule}>• {failure.message}</li>)}
              </ul>
            ) : null}
          </form>

          <form className="card space-y-4" onSubmit={submitSlip}>
            <h2 className="text-xl font-bold">2. Upload salary slip</h2>
            <p className="text-sm text-slate-600">Allowed: PDF, JPG, PNG. Maximum size: 5 MB.</p>
            <input className="input" type="file" accept="application/pdf,image/jpeg,image/png" onChange={(e) => setSalarySlip(e.target.files?.[0] ?? null)} />
            <button className="btn-primary w-full" disabled={!state.application?.brePassed || !salarySlip}>Upload salary slip</button>
            {state.application?.salarySlip?.url ? (
              <a className="text-sm font-semibold text-slate-900 underline" href={fileUrl(state.application.salarySlip.url)} target="_blank">View uploaded salary slip</a>
            ) : null}
          </form>

          <form className="card space-y-5" onSubmit={apply}>
            <h2 className="text-xl font-bold">3. Loan configuration</h2>
            <Slider label="Loan amount" value={amount} min={50000} max={500000} step={10000} onChange={setAmount} display={formatINR(amount)} />
            <Slider label="Tenure" value={tenureDays} min={30} max={365} step={5} onChange={setTenureDays} display={`${tenureDays} days`} />
            <div className="rounded-2xl bg-slate-50 p-4 text-sm">
              <div className="flex justify-between"><span>Interest @ 12% p.a.</span><strong>{formatINR(calculation.interestAmount)}</strong></div>
              <div className="mt-2 flex justify-between text-base"><span>Total repayment</span><strong>{formatINR(calculation.totalRepayment)}</strong></div>
            </div>
            <button className="btn-primary w-full" disabled={!state.application?.salarySlip || Boolean(state.loan && ['APPLIED', 'SANCTIONED', 'DISBURSED'].includes(state.loan.status))}>Apply</button>
          </form>
        </div>

        {state.loan ? <LoanSummary loan={state.loan} payments={state.payments} /> : null}
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-2"><span className="label">{label}</span>{children}</label>;
}

function Slider({ label, value, min, max, step, display, onChange }: { label: string; value: number; min: number; max: number; step: number; display: string; onChange: (value: number) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between"><span className="label">{label}</span><span className="font-bold">{display}</span></div>
      <input className="w-full" type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return <span className="rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white">{status}</span>;
}

function LoanSummary({ loan, payments }: { loan: Loan; payments: Payment[] }) {
  return (
    <section className="card mt-6">
      <h2 className="text-xl font-bold">Loan summary</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-5">
        <Metric label="Principal" value={formatINR(loan.amount)} />
        <Metric label="Interest" value={formatINR(loan.interestAmount)} />
        <Metric label="Repayment" value={formatINR(loan.totalRepayment)} />
        <Metric label="Paid" value={formatINR(loan.totalPaid)} />
        <Metric label="Outstanding" value={formatINR(loan.outstandingBalance)} />
      </div>
      {payments.length ? <h3 className="mt-6 font-bold">Payments</h3> : null}
      <div className="mt-3 grid gap-2">
        {payments.map((payment) => (
          <div key={payment.id} className="flex flex-wrap justify-between rounded-xl border border-slate-200 p-3 text-sm">
            <span className="font-semibold">UTR: {payment.utrNumber}</span>
            <span>{formatINR(payment.amount)} • {new Date(payment.paidAt).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase text-slate-500">{label}</p><p className="mt-1 text-lg font-black">{value}</p></div>;
}
