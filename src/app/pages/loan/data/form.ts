import { AgreementFormModel, CalculatorFormModel, LoanDetailFormModel, OtpFormModel } from '../models';
import { buildFlowAddresses } from '../utils/address';
import { createDefaultFinanceForm } from '@pages/loan/utils/finance-months';

export const calculatorFormModel: CalculatorFormModel = {
  loanAmount: 0,
  loanTerm: 0,
  sysPaymentTypeId: 'annuity',
};

export const agreementFormModel: AgreementFormModel = {
  offer: false,
};

export const loanDetailFormModel: LoanDetailFormModel = {
  ...calculatorFormModel,
  filialCode: null,
  addresses: buildFlowAddresses(),
  finData: createDefaultFinanceForm(),
};

export const otpFormModel: OtpFormModel = {
  code: null,
};
