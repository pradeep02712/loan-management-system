import { Schema, model, type Document, type Types } from 'mongoose';
import { LoanStatus, type LoanStatusValue } from '../constants/enums';

export interface ILoan extends Document {
  borrower: Types.ObjectId;
  application: Types.ObjectId;
  amount: number;
  tenureDays: number;
  interestRate: number;
  interestAmount: number;
  totalRepayment: number;
  totalPaid: number;
  status: LoanStatusValue;
  rejectionReason?: string;
  sanctionedBy?: Types.ObjectId;
  sanctionedAt?: Date;
  disbursedBy?: Types.ObjectId;
  disbursedAt?: Date;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const loanSchema = new Schema<ILoan>(
  {
    borrower: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    application: { type: Schema.Types.ObjectId, ref: 'Application', required: true },
    amount: { type: Number, required: true, min: 50000, max: 500000 },
    tenureDays: { type: Number, required: true, min: 30, max: 365 },
    interestRate: { type: Number, required: true, default: 12 },
    interestAmount: { type: Number, required: true, min: 0 },
    totalRepayment: { type: Number, required: true, min: 0 },
    totalPaid: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: Object.values(LoanStatus), default: LoanStatus.APPLIED, index: true },
    rejectionReason: { type: String, trim: true, maxlength: 500 },
    sanctionedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    sanctionedAt: Date,
    disbursedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    disbursedAt: Date,
    closedAt: Date
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

loanSchema.virtual('outstandingBalance').get(function outstandingBalance() {
  return Math.max(0, Math.round((this.totalRepayment - this.totalPaid + Number.EPSILON) * 100) / 100);
});

loanSchema.index({ borrower: 1, status: 1 });
loanSchema.index({ createdAt: -1 });

loanSchema.set('toJSON', {
  virtuals: true,
  transform(_doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export const Loan = model<ILoan>('Loan', loanSchema);
