export interface CreditInput {
  amount: number;
  term: number;
  annualRate: number; // 0.18
}

export interface CreditOutput {
  amount: number;
  monthlyPayment: number;
  annualRate: number;
}

export type CreditType = 'annuity' | 'differentiated';
