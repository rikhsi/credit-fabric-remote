import { CreditType } from '@app/typings/calculator';

export interface CalculatorFormModel {
  amount: number;
  dirCreditPurposeId: string | null;
  type: CreditType;
  term: number;
}

export interface AgreementFormModel {
  offer: boolean;
}

export interface OtpFormModel {
  code: string;
}
