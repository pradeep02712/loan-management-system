export const Roles = {
  ADMIN: 'admin',
  SALES: 'sales',
  SANCTION: 'sanction',
  DISBURSEMENT: 'disbursement',
  COLLECTION: 'collection',
  BORROWER: 'borrower'
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];

export const roleValues = Object.values(Roles);

export const EmploymentModes = {
  SALARIED: 'salaried',
  SELF_EMPLOYED: 'self-employed',
  UNEMPLOYED: 'unemployed'
} as const;

export type EmploymentMode = (typeof EmploymentModes)[keyof typeof EmploymentModes];

export const ApplicationStatus = {
  DRAFT: 'DRAFT',
  BRE_REJECTED: 'BRE_REJECTED',
  ELIGIBLE: 'ELIGIBLE',
  APPLIED: 'APPLIED'
} as const;

export type ApplicationStatusValue = (typeof ApplicationStatus)[keyof typeof ApplicationStatus];

export const LoanStatus = {
  APPLIED: 'APPLIED',
  SANCTIONED: 'SANCTIONED',
  REJECTED: 'REJECTED',
  DISBURSED: 'DISBURSED',
  CLOSED: 'CLOSED'
} as const;

export type LoanStatusValue = (typeof LoanStatus)[keyof typeof LoanStatus];
