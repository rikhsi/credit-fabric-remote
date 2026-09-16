import { CreditType } from '@app/typings/calculator';
import { OnlineStartProcessingAddress } from '@api/models/los/start-processing';

export interface CalculatorFormModel {
  amount: number;
  dirCreditPurposeId: string | null;
  type: CreditType;
  term: number;
}

export interface AgreementFormModel {
  offer: boolean;
}

export interface LoanDetailFormModel extends CalculatorFormModel, AgreementFormModel {
  addresses: OnlineStartProcessingAddress[];
}

export interface OtpFormModel {
  code: string;
}
