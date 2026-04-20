import { CreditPaymentType } from './term';

export interface CalculatorFormModel {
  amount: number;
  type: CreditPaymentType;
  term: number;
}

export interface AgreementFormModel {
  offer: boolean;
}
