import { CreditType } from '@app/typings/calculator';
import { StartProcessingAddress, StartProcessingFinData } from '@api/models/los/start-processing';

export interface CalculatorFormModel {
  loanAmount: number;
  loanTerm: number;
  sysPaymentTypeId: CreditType;
}

/** The public offer is a front-end only guard, it is never sent to start-processing. */
export interface AgreementFormModel {
  offer: boolean;
}

export interface LoanDetailFormModel extends CalculatorFormModel {
  filialCode: number | null;
  addresses: StartProcessingAddress[];
  finData: StartProcessingFinData;
}

export interface OtpFormModel {
  code: string;
}
