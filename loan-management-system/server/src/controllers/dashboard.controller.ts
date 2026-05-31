import { Application } from '../models/Application';
import { Loan } from '../models/Loan';
import { Payment } from '../models/Payment';
import { User } from '../models/User';
import { LoanStatus, Roles } from '../constants/enums';
import { rejectLoanSchema, paymentSchema } from '../validation/dashboard.validation';
import { ApiError, asyncHandler, ok } from '../utils/http';
import { roundMoney } from '../utils/money';

const loanPopulate = [
  { path: 'borrower', select: 'fullName email role createdAt' },
  { path: 'application' },
  { path: 'sanctionedBy', select: 'fullName email role' },
  { path: 'disbursedBy', select: 'fullName email role' }
];

export const getSalesLeads = asyncHandler(async (_req, res) => {
  const borrowers = await User.find({ role: Roles.BORROWER }).sort({ createdAt: -1 });
  const borrowerIds = borrowers.map((u) => u.id);
  const loans = await Loan.find({ borrower: { $in: borrowerIds } }).select('borrower');
  const appliedBorrowerIds = new Set(loans.map((loan) => loan.borrower.toString()));
  const applications = await Application.find({ borrower: { $in: borrowerIds } });
  const applicationByBorrower = new Map(applications.map((app) => [app.borrower.toString(), app]));

  const leads = borrowers
    .filter((borrower) => !appliedBorrowerIds.has(borrower.id))
    .map((borrower) => ({
      borrower,
      application: applicationByBorrower.get(borrower.id) ?? null,
      leadStage: applicationByBorrower.get(borrower.id)?.status ?? 'REGISTERED_ONLY'
    }));

  ok(res, { leads });
});

export const getSanctionLoans = asyncHandler(async (_req, res) => {
  const loans = await Loan.find({ status: LoanStatus.APPLIED }).populate(loanPopulate).sort({ createdAt: -1 });
  ok(res, { loans });
});

export const approveLoan = asyncHandler(async (req, res) => {
  const loan = await Loan.findById(req.params.loanId);
  if (!loan) throw new ApiError(404, 'Loan not found.');
  if (loan.status !== LoanStatus.APPLIED) {
    throw new ApiError(409, `Only APPLIED loans can be sanctioned. Current status: ${loan.status}.`);
  }

  loan.status = LoanStatus.SANCTIONED;
  loan.sanctionedBy = req.user!.id;
  loan.sanctionedAt = new Date();
  await loan.save();

  await loan.populate(loanPopulate);
  ok(res, { loan, message: 'Loan sanctioned successfully.' });
});

export const rejectLoan = asyncHandler(async (req, res) => {
  const input = rejectLoanSchema.parse(req.body);
  const loan = await Loan.findById(req.params.loanId);
  if (!loan) throw new ApiError(404, 'Loan not found.');
  if (loan.status !== LoanStatus.APPLIED) {
    throw new ApiError(409, `Only APPLIED loans can be rejected. Current status: ${loan.status}.`);
  }

  loan.status = LoanStatus.REJECTED;
  loan.rejectionReason = input.reason;
  loan.sanctionedBy = req.user!.id;
  loan.sanctionedAt = new Date();
  await loan.save();

  await loan.populate(loanPopulate);
  ok(res, { loan, message: 'Loan rejected successfully.' });
});

export const getDisbursementLoans = asyncHandler(async (_req, res) => {
  const loans = await Loan.find({ status: LoanStatus.SANCTIONED }).populate(loanPopulate).sort({ sanctionedAt: -1 });
  ok(res, { loans });
});

export const disburseLoan = asyncHandler(async (req, res) => {
  const loan = await Loan.findById(req.params.loanId);
  if (!loan) throw new ApiError(404, 'Loan not found.');
  if (loan.status !== LoanStatus.SANCTIONED) {
    throw new ApiError(409, `Only SANCTIONED loans can be disbursed. Current status: ${loan.status}.`);
  }

  loan.status = LoanStatus.DISBURSED;
  loan.disbursedBy = req.user!.id;
  loan.disbursedAt = new Date();
  await loan.save();

  await loan.populate(loanPopulate);
  ok(res, { loan, message: 'Loan disbursed successfully.' });
});

export const getCollectionLoans = asyncHandler(async (_req, res) => {
  const loans = await Loan.find({ status: LoanStatus.DISBURSED }).populate(loanPopulate).sort({ disbursedAt: -1 });
  ok(res, { loans });
});

export const recordPayment = asyncHandler(async (req, res) => {
  const input = paymentSchema.parse(req.body);
  const loan = await Loan.findById(req.params.loanId);

  if (!loan) throw new ApiError(404, 'Loan not found.');
  if (loan.status !== LoanStatus.DISBURSED) {
    throw new ApiError(409, `Payments can be recorded only for DISBURSED loans. Current status: ${loan.status}.`);
  }

  const outstanding = roundMoney(loan.totalRepayment - loan.totalPaid);
  if (input.amount > outstanding) {
    throw new ApiError(422, `Payment amount cannot exceed outstanding balance of ₹${outstanding}.`);
  }

  const existingUtr = await Payment.findOne({ utrNumber: input.utrNumber });
  if (existingUtr) {
    throw new ApiError(409, 'UTR number already exists.');
  }

  const payment = await Payment.create({
    loan: loan.id,
    borrower: loan.borrower,
    utrNumber: input.utrNumber,
    amount: roundMoney(input.amount),
    paidAt: input.paidAt,
    recordedBy: req.user!.id
  });

  loan.totalPaid = roundMoney(loan.totalPaid + input.amount);
  if (loan.totalPaid >= loan.totalRepayment) {
    loan.totalPaid = loan.totalRepayment;
    loan.status = LoanStatus.CLOSED;
    loan.closedAt = new Date();
  }
  await loan.save();

  await loan.populate(loanPopulate);
  ok(res, { payment, loan, message: loan.status === LoanStatus.CLOSED ? 'Payment recorded and loan closed.' : 'Payment recorded successfully.' }, 201);
});
