import { Schema, model, type Document, type Types } from 'mongoose';
import {
  ApplicationStatus,
  EmploymentModes,
  type ApplicationStatusValue,
  type EmploymentMode
} from '../constants/enums';
import type { BreFailure } from '../services/bre.service';

export interface IApplication extends Document {
  borrower: Types.ObjectId;
  fullName?: string;
  pan?: string;
  dateOfBirth?: Date;
  age?: number;
  monthlySalary?: number;
  employmentMode?: EmploymentMode;
  brePassed: boolean;
  breFailures: BreFailure[];
  salarySlip?: {
    originalName: string;
    filename: string;
    mimeType: string;
    size: number;
    path: string;
    url: string;
  };
  status: ApplicationStatusValue;
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    borrower: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    fullName: { type: String, trim: true, maxlength: 120 },
    pan: { type: String, uppercase: true, trim: true, index: true },
    dateOfBirth: { type: Date },
    age: { type: Number, min: 0 },
    monthlySalary: { type: Number, min: 0 },
    employmentMode: {
      type: String,
      enum: Object.values(EmploymentModes)
    },
    brePassed: { type: Boolean, default: false },
    breFailures: [
      {
        rule: { type: String, required: true },
        message: { type: String, required: true }
      }
    ],
    salarySlip: {
      originalName: String,
      filename: String,
      mimeType: String,
      size: Number,
      path: String,
      url: String
    },
    status: { type: String, enum: Object.values(ApplicationStatus), default: ApplicationStatus.DRAFT, index: true }
  },
  { timestamps: true }
);

applicationSchema.set('toJSON', {
  transform(_doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export const Application = model<IApplication>('Application', applicationSchema);
