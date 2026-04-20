import { CreditInput, CreditOutput } from '@app/typings/calculator';

export function calculateAnnuity(input: CreditInput): CreditOutput {
  const { amount: P, term: n, annualRate } = input;

  const r = annualRate / 12;

  const monthlyPayment = (P * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);

  return {
    amount: P,
    monthlyPayment: Math.round(monthlyPayment),
    annualRate,
  };
}

export function calculateDifferential(input: CreditInput): CreditOutput {
  const { amount: P, term: n, annualRate } = input;

  const r = annualRate / 12;
  const principalPart = P / n;

  const payments: number[] = [];

  for (let k = 1; k <= n; k++) {
    const remaining = P - principalPart * (k - 1);
    const payment = principalPart + remaining * r;

    payments.push(Math.round(payment));
  }

  const maxPayment = payments[0];

  return {
    amount: P,
    monthlyPayment: maxPayment,
    annualRate,
  };
}
