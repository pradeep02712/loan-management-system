'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Header } from '@/components/Header';
import { Protected } from '@/components/Protected';
import { api, ApiClientError } from '@/lib/api';
import { formatINR } from '@/lib/money';
import { Lead, Loan, Role } from '@/lib/types';
import { useAuth } from '@/lib/auth';

const moduleConfig: Array<{ key: ModuleKey; label: string; roles: Role[] }> = [
  { key: 'sales', label: 'Sales', roles: ['admin', 'sales'] },
  { key: 'sanction', label: 'Sanction', roles: ['admin', 'sanction'] },
  { key: 'disbursement', label: 'Disbursement', roles: ['admin', 'disbursement'] },
  { key: 'collection', label: 'Collection', roles: ['admin', 'collection'] }
];

type ModuleKey = 'sales' | 'sanction' | 'disbursement' | 'collection';

export default function DashboardPage() {
  return (
    <Protected roles={['admin', 'sales', 'sanction', 'disbursement', 'collection']}>
      <Dashboard />
    </Protected>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const allowedModules = useMemo(() => moduleConfig.filter((module) => user && module.roles.includes(user.role)), [user]);
  const [active, setActive] = useState<ModuleKey>(allowedModules[0]?.key ?? 'sales');

  useEffect(() => {
    if (allowedModules.length && !allowedModules.some((module) => module.key === active)) {
      setActive(allowedModules[0].key);
    }
  }, [allowedModules, active]);

  return (
    <main>
      <Header />
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Operations Dashboard</p>
          <h1 className="mt-2 text-3xl font-black">Role-based loan operations</h1>
        </div>
        <div className="mb-6 flex flex-wrap gap-3">
          {allowedModules.map((module) => (
            <button
              key={module.key}
              className={active === module.key ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setActive(module.key)}
            >
              {module.label}
            </button>
          ))}
        </div>
        {active === 'sales' ? <SalesModule /> : null}
        {active === 'sanction' ? <SanctionModule /> : null}
        {active === 'disbursement' ? <DisbursementModule /> : null}
        {active === 'collection' ? <CollectionModule /> : null}
      </section>
    </main>
  );
}

function useMessage() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  function handleError(err: unknown) {
    setMessage('');
    setError(err instanceof ApiClientError ? err.message : 'Something went wrong');
  }
  return { message, setMessage, error, setError, handleError };
}

function SalesModule() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const { error, handleError } = useMessage();
  useEffect(() => {
    api<{ leads: Lead[] }>('/dashboard/sales/leads').then((data) => setLeads(data.leads)).catch(handleError);
  }, []);
  return (
    <section className="card">
      <ModuleHeader title="Sales leads" description="Borrowers who registered but have not applied for a loan yet." />
      {error ? <Alert type="error" text={error} /> : null}
      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-slate-500"><tr><th className="py-3">Borrower</th><th>Email</th><th>Stage</th><th>Salary</th><th>Registered</th></tr></thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.borrower.id} className="border-b last:border-0">
                <td className="py-3 font-semibold">{lead.borrower.fullName}</td>
                <td>{lead.borrower.email}</td>
                <td>{lead.leadStage}</td>
                <td>{lead.application?.monthlySalary ? formatINR(lead.application.monthlySalary) : '-'}</td>
                <td>{lead.borrower.createdAt ? new Date(lead.borrower.createdAt).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SanctionModule() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [reasonByLoan, setReasonByLoan] = useState<Record<string, string>>({});
  const { message, setMessage, error, setError, handleError } = useMessage();

  async function load() {
    const data = await api<{ loans: Loan[] }>('/dashboard/sanction/loans');
    setLoans(data.loans);
  }
  useEffect(() => { load().catch(handleError); }, []);

  async function approve(loanId: string) {
    setError('');
    try {
      await api(`/dashboard/sanction/loans/${loanId}/approve`, { method: 'POST' });
      setMessage('Loan sanctioned successfully.');
      await load();
    } catch (err) { handleError(err); }
  }

  async function reject(event: FormEvent, loanId: string) {
    event.preventDefault();
    setError('');
    try {
      await api(`/dashboard/sanction/loans/${loanId}/reject`, { method: 'POST', body: JSON.stringify({ reason: reasonByLoan[loanId] }) });
      setMessage('Loan rejected successfully.');
      await load();
    } catch (err) { handleError(err); }
  }

  return (
    <section className="card">
      <ModuleHeader title="Sanction queue" description="Review APPLIED loans and approve or reject with a reason." />
      <Feedback message={message} error={error} />
      <div className="mt-5 grid gap-4">
        {loans.map((loan) => (
          <LoanCard key={loan.id} loan={loan}>
            <div className="flex flex-wrap gap-2">
              <button className="btn-primary" onClick={() => approve(loan.id)}>Approve</button>
              <form className="flex flex-wrap gap-2" onSubmit={(event) => reject(event, loan.id)}>
                <input className="input w-72" placeholder="Rejection reason" value={reasonByLoan[loan.id] ?? ''} onChange={(e) => setReasonByLoan({ ...reasonByLoan, [loan.id]: e.target.value })} />
                <button className="btn-secondary">Reject</button>
              </form>
            </div>
          </LoanCard>
        ))}
      </div>
    </section>
  );
}

function DisbursementModule() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const { message, setMessage, error, setError, handleError } = useMessage();
  async function load() {
    const data = await api<{ loans: Loan[] }>('/dashboard/disbursement/loans');
    setLoans(data.loans);
  }
  useEffect(() => { load().catch(handleError); }, []);
  async function disburse(loanId: string) {
    setError('');
    try {
      await api(`/dashboard/disbursement/loans/${loanId}/disburse`, { method: 'POST' });
      setMessage('Loan disbursed successfully.');
      await load();
    } catch (err) { handleError(err); }
  }
  return (
    <section className="card">
      <ModuleHeader title="Disbursement queue" description="Mark SANCTIONED loans as funds released." />
      <Feedback message={message} error={error} />
      <div className="mt-5 grid gap-4">
        {loans.map((loan) => <LoanCard key={loan.id} loan={loan}><button className="btn-primary" onClick={() => disburse(loan.id)}>Mark disbursed</button></LoanCard>)}
      </div>
    </section>
  );
}

function CollectionModule() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [paymentByLoan, setPaymentByLoan] = useState<Record<string, { utrNumber: string; amount: string; paidAt: string }>>({});
  const { message, setMessage, error, setError, handleError } = useMessage();
  async function load() {
    const data = await api<{ loans: Loan[] }>('/dashboard/collection/loans');
    setLoans(data.loans);
  }
  useEffect(() => { load().catch(handleError); }, []);
  async function record(event: FormEvent, loan: Loan) {
    event.preventDefault();
    setError('');
    const payment = paymentByLoan[loan.id];
    try {
      await api(`/dashboard/collection/loans/${loan.id}/payments`, { method: 'POST', body: JSON.stringify(payment) });
      setMessage('Payment recorded successfully.');
      setPaymentByLoan({ ...paymentByLoan, [loan.id]: { utrNumber: '', amount: '', paidAt: '' } });
      await load();
    } catch (err) { handleError(err); }
  }
  return (
    <section className="card">
      <ModuleHeader title="Collection queue" description="Record borrower payments. Loans auto-close after full repayment." />
      <Feedback message={message} error={error} />
      <div className="mt-5 grid gap-4">
        {loans.map((loan) => {
          const payment = paymentByLoan[loan.id] ?? { utrNumber: '', amount: '', paidAt: new Date().toISOString().slice(0, 10) };
          return (
            <LoanCard key={loan.id} loan={loan}>
              <form className="grid gap-2 md:grid-cols-[1fr_1fr_1fr_auto]" onSubmit={(event) => record(event, loan)}>
                <input className="input" placeholder="UTR number" value={payment.utrNumber} onChange={(e) => setPaymentByLoan({ ...paymentByLoan, [loan.id]: { ...payment, utrNumber: e.target.value.toUpperCase() } })} required />
                <input className="input" placeholder="Amount" type="number" max={loan.outstandingBalance} value={payment.amount} onChange={(e) => setPaymentByLoan({ ...paymentByLoan, [loan.id]: { ...payment, amount: e.target.value } })} required />
                <input className="input" type="date" value={payment.paidAt} onChange={(e) => setPaymentByLoan({ ...paymentByLoan, [loan.id]: { ...payment, paidAt: e.target.value } })} required />
                <button className="btn-primary">Record</button>
              </form>
            </LoanCard>
          );
        })}
      </div>
    </section>
  );
}

function ModuleHeader({ title, description }: { title: string; description: string }) {
  return <div><h2 className="text-xl font-black">{title}</h2><p className="mt-1 text-sm text-slate-600">{description}</p></div>;
}

function Alert({ type, text }: { type: 'error' | 'success'; text: string }) {
  return <div className={`mt-4 rounded-xl p-3 text-sm font-semibold ${type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>{text}</div>;
}

function Feedback({ message, error }: { message: string; error: string }) {
  return <>{message ? <Alert type="success" text={message} /> : null}{error ? <Alert type="error" text={error} /> : null}</>;
}

function LoanCard({ loan, children }: { loan: Loan; children: React.ReactNode }) {
  const borrower = typeof loan.borrower === 'string' ? null : loan.borrower;
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <p className="font-black">{borrower?.fullName ?? 'Borrower'}</p>
          <p className="text-sm text-slate-600">{borrower?.email}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">{loan.status}</span>
      </div>
      <div className="mt-4 grid gap-3 text-sm md:grid-cols-5">
        <Metric label="Principal" value={formatINR(loan.amount)} />
        <Metric label="Tenure" value={`${loan.tenureDays} days`} />
        <Metric label="Interest" value={formatINR(loan.interestAmount)} />
        <Metric label="Repayment" value={formatINR(loan.totalRepayment)} />
        <Metric label="Outstanding" value={formatINR(loan.outstandingBalance)} />
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs font-bold uppercase text-slate-500">{label}</p><p className="mt-1 font-black">{value}</p></div>;
}
