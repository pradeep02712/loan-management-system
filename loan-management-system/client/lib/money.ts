export function formatINR(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(value || 0);
}

export function calculateLoan(amount: number, tenureDays: number, interestRate = 12) {
  const interestAmount = Math.round(((amount * interestRate * tenureDays) / (365 * 100)) * 100) / 100;
  const totalRepayment = Math.round((amount + interestAmount) * 100) / 100;
  return { interestAmount, totalRepayment };
}
