import path from 'path';
import { Application } from '../models/Application';
import { Loan } from '../models/Loan';
import { Payment } from '../models/Payment';
import { ApplicationStatus, LoanStatus } from '../constants/enums';
import { runBre } from '../services/bre.service';
import { calculateLoan } from '../utils/money';
import { ApiError, asyncHandler, ok } from '../utils/http';
import { loanApplySchema, personalDetailsSchema } from '../validation/borrower.validation';

export const getBorrowerApplication = asyncHandler(async (req, res) => {
  const borrowerId = req.user!.id;
  const application = await Application.findOne({ borrower: borrowerId });
  const loan = await Loan.findOne({ borrower: borrowerId }).sort({ createdAt: -1 });
  const payments = loan ? await Payment.find({ loan: loan.id }).sort({ paidAt: -1 }) : [];

  ok(res, { application, loan, payments });
});

export const savePersonalDetails = asyncHandler(async (req, res) => {
  const borrowerId = req.user!.id;
  const input = personalDetailsSchema.parse(req.body);
  const bre = runBre(input);

  const application = await Application.findOneAndUpdate(
    { borrower: borrowerId },
    {
      borrower: borrowerId,
      fullName: input.fullName,
      pan: input.pan.toUpperCase(),
      dateOfBirth: input.dateOfBirth,
      age: bre.age,
      monthlySalary: input.monthlySalary,
      employmentMode: input.employmentMode,
      brePassed: bre.passed,
      breFailures: bre.failures,
      status: bre.passed ? ApplicationStatus.ELIGIBLE : ApplicationStatus.BRE_REJECTED
    },
    { new: true, upsert: true, runValidators: true }
  );

  if (!bre.passed) {
    throw new ApiError(422, 'BRE eligibility check failed.', { application, failures: bre.failures });
  }

  ok(res, { application, message: 'Eligibility check passed.' });
});

export const uploadSalarySlip = asyncHandler(async (req, res) => {
  const borrowerId = req.user!.id;
  const file = req.file;

  if (!file) {
    throw new ApiError(400, 'Salary slip file is required.');
  }

  const application = await Application.findOne({ borrower: borrowerId });
  if (!application || !application.brePassed || application.status === ApplicationStatus.BRE_REJECTED) {
    throw new ApiError(400, 'Complete personal details and pass BRE before uploading salary slip.');
  }

  application.salarySlip = {
    originalName: file.originalname,
    filename: file.filename,
    mimeType: file.mimetype,
    size: file.size,
    path: file.path,
    url: `/uploads/salary-slips/${path.basename(file.filename)}`
  };
  await application.save();

  ok(res, { application, message: 'Salary slip uploaded successfully.' });
});

export const applyForLoan = asyncHandler(async (req, res) => {
  const borrowerId = req.user!.id;
  const input = loanApplySchema.parse(req.body);
  const application = await Application.findOne({ borrower: borrowerId });

  if (!application || !application.brePassed) {
    throw new ApiError(400, 'You must pass BRE before applying for a loan.');
  }

  if (!application.salarySlip?.url) {
    throw new ApiError(400, 'Upload salary slip before applying for a loan.');
  }

  const existingActiveLoan = await Loan.findOne({
    borrower: borrowerId,
    status: { $in: [LoanStatus.APPLIED, LoanStatus.SANCTIONED, LoanStatus.DISBURSED] }
  });

  if (existingActiveLoan) {
    throw new ApiError(409, 'You already have an active loan request.');
  }

  const calculation = calculateLoan(input.amount, input.tenureDays);
  const loan = await Loan.create({
    borrower: borrowerId,
    application: application.id,
    amount: input.amount,
    tenureDays: input.tenureDays,
    interestRate: calculation.interestRate,
    interestAmount: calculation.interestAmount,
    totalRepayment: calculation.totalRepayment,
    status: LoanStatus.APPLIED
  });

  application.status = ApplicationStatus.APPLIED;
  await application.save();

  ok(res, { loan }, 201);
});
