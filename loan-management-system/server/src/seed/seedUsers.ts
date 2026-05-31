import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db';
import { Roles, type Role } from '../constants/enums';
import { User } from '../models/User';
import mongoose from 'mongoose';

const password = 'Password@123';

const users: Array<{ fullName: string; email: string; role: Role }> = [
  { fullName: 'LMS Admin', email: 'admin@lms.dev', role: Roles.ADMIN },
  { fullName: 'Sales Executive', email: 'sales@lms.dev', role: Roles.SALES },
  { fullName: 'Sanction Executive', email: 'sanction@lms.dev', role: Roles.SANCTION },
  { fullName: 'Disbursement Executive', email: 'disbursement@lms.dev', role: Roles.DISBURSEMENT },
  { fullName: 'Collection Executive', email: 'collection@lms.dev', role: Roles.COLLECTION },
  { fullName: 'Demo Borrower', email: 'borrower@lms.dev', role: Roles.BORROWER }
];

async function seed() {
  await connectDB();
  const passwordHash = await bcrypt.hash(password, 12);

  for (const user of users) {
    await User.findOneAndUpdate(
      { email: user.email },
      { ...user, passwordHash, isActive: true },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`Seeded ${user.role}: ${user.email}`);
  }

  console.log(`\nAll seeded users use password: ${password}`);
}

seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
