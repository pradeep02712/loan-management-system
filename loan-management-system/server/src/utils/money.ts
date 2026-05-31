export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateLoan(amount: number, tenureDays: number, interestRate = 12) {
  const interestAmount = roundMoney((amount * interestRate * tenureDays) / (365 * 100));
  const totalRepayment = roundMoney(amount + interestAmount);

  return {
    principalAmount: amount,
    tenureDays,
    interestRate,
    interestAmount,
    totalRepayment
  };
}
