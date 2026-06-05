import { AgreementFormModel, CalculatorFormModel, OtpFormModel } from '../models';

export const calculatorFormModel: CalculatorFormModel = {
  amount: 0,
  dirCreditPurposeId: null,
  term: 0,
  type: 'annuity',
};

export const agreementFormModel: AgreementFormModel = {
  offer: false,
};

export const otpFormModel: OtpFormModel = {
  code: null,
};
