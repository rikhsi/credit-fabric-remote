import { AgreementFormModel, CalculatorFormModel, LoanDetailFormModel, OtpFormModel } from '../models';
import { buildRequiredAddresses } from '../utils/address';

export const calculatorFormModel: CalculatorFormModel = {
  amount: 0,
  dirCreditPurposeId: null,
  term: 0,
  type: 'annuity',
};

export const agreementFormModel: AgreementFormModel = {
  offer: false,
};

export const loanDetailFormModel: LoanDetailFormModel = {
  ...calculatorFormModel,
  ...agreementFormModel,
  addresses: buildRequiredAddresses(),
};

export const otpFormModel: OtpFormModel = {
  code: null,
};
