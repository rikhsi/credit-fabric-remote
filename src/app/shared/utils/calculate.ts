import { CreditInput, CreditOutput } from '@app/typings/calculator';

export function calculateAnnuity(input: CreditInput): CreditOutput {
  const { amount: P, term: n, annualRate } = input;

  const r = annualRate / 100 / 12;

  const monthlyPayment = (P * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);

  return {
    amount: P,
    monthlyPayment: Math.round(monthlyPayment),
    annualRate,
  };
}

export function calculateDifferential(input: CreditInput): CreditOutput {
  const { amount: P, term: n, annualRate } = input;

  const r = annualRate / 100 / 12;
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

export function isDifferentialPaymentType(paymentType: string | null | undefined): boolean {
  return (paymentType ?? '').toLowerCase() === 'standart';
}

export function calculateMonthlyPayment(amount: number, term: number, annualRate: number, paymentType: string): number {
  const input: CreditInput = { amount, term, annualRate };

  return isDifferentialPaymentType(paymentType) ? calculateDifferential(input).monthlyPayment : calculateAnnuity(input).monthlyPayment;
}

export function calculateOverpayment(amount: number, term: number, annualRate: number, paymentType: string): number {
  const input: CreditInput = { amount, term, annualRate };

  if (isDifferentialPaymentType(paymentType)) {
    const r = annualRate / 100 / 12;
    const principalPart = amount / term;
    let total = 0;

    for (let k = 1; k <= term; k++) {
      const remaining = amount - principalPart * (k - 1);
      total += principalPart + remaining * r;
    }

    return Math.round(total - amount);
  }

  const { monthlyPayment } = calculateAnnuity(input);

  return monthlyPayment * term - amount;
}
