import { z } from 'zod';

export const rejectLoanSchema = z.object({
  reason: z.string().trim().min(5).max(500)
});

export const paymentSchema = z.object({
  utrNumber: z.string().trim().min(6).max(50).toUpperCase(),
  amount: z.coerce.number().positive(),
  paidAt: z.coerce.date()
});
