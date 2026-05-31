export type Role = 'admin' | 'sales' | 'sanction' | 'disbursement' | 'collection' | 'borrower';

export type User = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  createdAt?: string;
};

export type BreFailure = {
  rule: string;
  message: string;
};

export type Application = {
  id: string;
  fullName?: string;
  pan?: string;
  dateOfBirth?: string;
  age?: number;
  monthlySalary?: number;
  employmentMode?: 'salaried' | 'self-employed' | 'unemployed';
  brePassed: boolean;
  breFailures: BreFailure[];
  salarySlip?: {
    originalName: string;
    filename: string;
    mimeType: string;
    size: number;
    url: string;
  };
  status: 'DRAFT' | 'BRE_REJECTED' | 'ELIGIBLE' | 'APPLIED';
  createdAt: string;
  updatedAt: string;
};

export type LoanStatus = 'APPLIED' | 'SANCTIONED' | 'REJECTED' | 'DISBURSED' | 'CLOSED';

export type Loan = {
  id: string;
  borrower: User | string;
  application: Application | string;
  amount: number;
  tenureDays: number;
  interestRate: number;
  interestAmount: number;
  totalRepayment: number;
  totalPaid: number;
  outstandingBalance: number;
  status: LoanStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
};

export type Payment = {
  id: string;
  loan: string;
  borrower: string;
  utrNumber: string;
  amount: number;
  paidAt: string;
  createdAt: string;
};

export type Lead = {
  borrower: User;
  application: Application | null;
  leadStage: string;
};

export type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
  details?: unknown;
};
