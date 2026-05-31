import { Schema, model, type Document, type Types } from 'mongoose';

export interface IPayment extends Document {
  loan: Types.ObjectId;
  borrower: Types.ObjectId;
  utrNumber: string;
  amount: number;
  paidAt: Date;
  recordedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    loan: { type: Schema.Types.ObjectId, ref: 'Loan', required: true, index: true },
    borrower: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    utrNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    amount: { type: Number, required: true, min: 1 },
    paidAt: { type: Date, required: true },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

paymentSchema.set('toJSON', {
  transform(_doc, ret) {
    const r = ret as any;
    r.id = r._id.toString();
    delete r._id;
    delete r.__v;
    return r;
  }
});

export const Payment = model<IPayment>('Payment', paymentSchema);
