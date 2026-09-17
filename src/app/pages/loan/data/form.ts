import { AgreementFormModel, CalculatorFormModel, LoanDetailFormModel, OtpFormModel } from '../models';
import { buildRequiredAddresses } from '../utils/address';
import { createDefaultFinanceForm } from '@pages/application/utils/finance-months';

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
  finData: createDefaultFinanceForm(),
};

export const otpFormModel: OtpFormModel = {
  code: null,
};
