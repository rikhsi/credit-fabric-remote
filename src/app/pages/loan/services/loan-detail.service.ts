import { computed, inject, Injectable, signal } from '@angular/core';
import { disabled, form, max, min, required } from '@angular/forms/signals';
import { map, tap } from 'rxjs';
import { agreementFormModel, calculatorFormModel } from '../data';
import { CreditInput, CreditOutput } from '@app/typings/calculator';
import { calculateAnnuity, calculateDifferential } from '@shared/utils';
import { OnlineApiService, ProductApiService } from '@api/controllers/los';
import { mergeProductConditions } from '@api/utils';
import { environment } from 'src/environments/development';
import { ProductConditionItem } from '@api/models/los/product';

@Injectable()
export class LoanDetailService {
  private onlineApiService = inject(OnlineApiService);
  private productApiService = inject(ProductApiService);

  public readonly isValidated = signal<boolean>(false);
  public readonly isLoading = signal<boolean>(true);
  public readonly isDisabled = signal<boolean>(true);
  public readonly productCondition = signal<ProductConditionItem>(null);

  public readonly calculatorForm = form(signal(calculatorFormModel), (schemaPath) => {
    min(schemaPath.amount, () => this.productCondition()?.minAmount ?? 0);
    max(schemaPath.amount, () => this.productCondition()?.maxAmount ?? 0);
    min(schemaPath.term, () => this.productCondition()?.minTerm ?? 0);
    max(schemaPath.term, () => this.productCondition()?.maxTerm ?? 0);
    required(schemaPath.dirCreditPurposeId);
    disabled(schemaPath, () => this.isDisabled());
  });

  public readonly agreementForm = form(signal(agreementFormModel), (schemaPath) => {
    required(schemaPath.offer);
    disabled(schemaPath, () => this.isDisabled() || this.isLoading());
  });

  public readonly calculationResult = computed<CreditOutput>(() => {
    const { amount, term, type } = this.calculatorForm;

    const input: CreditInput = {
      amount: amount().value(),
      term: term().value(),
      annualRate: this.productCondition()?.interestRate,
    };

    if (type().value() === 'annuity') {
      return calculateAnnuity(input);
    }

    return calculateDifferential(input);
  });

  public checkValidate$(pinfl: string) {
    return this.onlineApiService.checkValidated$(pinfl).pipe(tap(({ isOtpValidated }) => this.isValidated.set(isOtpValidated)));
  }

  public createShortApplication$() {
    const { amount, dirCreditPurposeId, type, term } = this.calculatorForm().value();

    this.isDisabled.set(true);

    return this.onlineApiService
      .createShortApplication$({
        applicantPersonalNo: environment.user.pinfl,
        dirCreditPurposeId,
        dirCurrencyId: 'UZS',
        initUsername: environment.user.name,
        loanAmount: amount,
        loanTerm: term,
        sysPaymentTypeId: type.toUpperCase(),
      })
      .pipe(
        tap({
          next: () => this.isDisabled.set(false),
          error: () => this.isDisabled.set(false),
        }),
      );
  }
}
