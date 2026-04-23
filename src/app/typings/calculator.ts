export interface CreditInput {
  amount: number;
  term: number;
  annualRate: number;
}

export interface CreditOutput {
  amount: number;
  monthlyPayment: number;
  annualRate: number;
}

export type CreditType = 'annuity' | 'differentiated';
