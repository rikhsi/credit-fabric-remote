import { computed, inject, Injectable, signal } from '@angular/core';
import { form, max, maxLength, min, minLength, required, validate } from '@angular/forms/signals';
import { tap } from 'rxjs';
import { agreementFormModel, calculatorFormModel, otpFormModel } from '../data';
import { CreditInput, CreditOutput } from '@app/typings/calculator';
import { calculateAnnuity, calculateDifferential } from '@shared/utils';
import { OnlineApiService } from '@api/controllers/los';

@Injectable()
export class LoanDetailService {
  private onlineApiService = inject(OnlineApiService);

  public readonly otpError = signal(false);
  public readonly isValidated = signal<boolean>(false);

  public readonly loanDetail = signal({
    amount: 30,
    term: 3,
    annualRate: 18,
    isGuarant: true,
  });

  public readonly calculatorForm = form(signal(calculatorFormModel), (schemaPath) => {
    min(schemaPath.amount, 10000000);
    max(schemaPath.amount, 100000000);
    min(schemaPath.term, 18);
    max(schemaPath.term, 36);
  });

  public readonly agreementForm = form(signal(agreementFormModel), (schemaPath) => {
    required(schemaPath.offer);
  });

  public readonly otpForm = form(signal(otpFormModel), (schemaPath) => {
    required(schemaPath.code);
    minLength(schemaPath.code, 6);
    maxLength(schemaPath.code, 6);
    validate(schemaPath.code, () => (this.otpError() ? { kind: 'invalidOtp' } : null));
  });

  public readonly calculationResult = computed<CreditOutput>(() => {
    const { amount, term, type } = this.calculatorForm;

    const input: CreditInput = {
      amount: amount().value(),
      term: term().value(),
      annualRate: 0.18,
    };

    if (type().value() === 'annuity') {
      return calculateAnnuity(input);
    }

    return calculateDifferential(input);
  });

  checkValidate$(pinfl: string) {
    return this.onlineApiService.checkValidated$(pinfl).pipe(tap(({ is_otp_validated }) => this.isValidated.set(is_otp_validated)));
  }
}
