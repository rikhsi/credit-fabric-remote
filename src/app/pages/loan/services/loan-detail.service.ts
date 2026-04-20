import { Injectable, signal } from '@angular/core';
import { form, max, maxLength, min, minLength, required, validate } from '@angular/forms/signals';
import { agreementFormModel, calculatorFormModel, otpFormModel } from '../data';

@Injectable()
export class LoanDetailService {
  public readonly otpError = signal(false);

  public readonly calculatorForm = form(calculatorFormModel, (schemaPath) => {
    min(schemaPath.amount, 10000000);
    max(schemaPath.amount, 100000000);
    min(schemaPath.term, 18);
    max(schemaPath.term, 36);
  });

  public readonly agreementForm = form(agreementFormModel, (schemaPath) => {
    required(schemaPath.offer);
  });

  public readonly otpForm = form(otpFormModel, (schemaPath) => {
    minLength(schemaPath.code, 6);
    maxLength(schemaPath.code, 6);
    validate(schemaPath.code, () => (this.otpError() ? { kind: 'invalidOtp' } : null));
  });
}
