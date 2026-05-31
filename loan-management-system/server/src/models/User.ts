import bcrypt from 'bcryptjs';
import { Schema, model, type Document } from 'mongoose';
import { Roles, roleValues, type Role } from '../constants/enums';

export interface IUser extends Document {
  fullName: string;
  email: string;
  passwordHash: string;
  role: Role;
  isActive: boolean;
  comparePassword(password: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: roleValues, default: Roles.BORROWER, index: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function comparePassword(password: string) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.set('toJSON', {
  transform(_doc, ret) {
    const r = ret as any;
    r.id = r._id.toString();
    delete r._id;
    delete r.__v;
    delete r.passwordHash;
    return r;
  }
});

export const User = model<IUser>('User', userSchema);
