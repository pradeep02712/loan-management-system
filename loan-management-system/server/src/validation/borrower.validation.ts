import { z } from 'zod';
import { EmploymentModes } from '../constants/enums';

export const personalDetailsSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  pan: z.string().trim().toUpperCase().length(10),
  dateOfBirth: z.coerce.date(),
  monthlySalary: z.coerce.number().positive(),
  employmentMode: z.enum([
    EmploymentModes.SALARIED,
    EmploymentModes.SELF_EMPLOYED,
    EmploymentModes.UNEMPLOYED
  ])
});

export const loanApplySchema = z.object({
  amount: z.coerce.number().min(50000).max(500000),
  tenureDays: z.coerce.number().int().min(30).max(365)
});
