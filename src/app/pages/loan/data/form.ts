import { signal } from '@angular/core';
import { AgreementFormModel, CalculatorFormModel, OtpFormModel } from '../models';

export const calculatorFormModel = signal<CalculatorFormModel>({
  amount: 0,
  term: 0,
  type: 'annuity',
});

export const agreementFormModel = signal<AgreementFormModel>({
  offer: false,
});

export const otpFormModel = signal<OtpFormModel>({
  code: null,
});
