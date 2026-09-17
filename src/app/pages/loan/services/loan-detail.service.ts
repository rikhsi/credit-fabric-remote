import { computed, inject, Injectable, signal } from '@angular/core';
import { disabled, form, max, min, required, requiredError, validate } from '@angular/forms/signals';
import { tap } from 'rxjs';
import { loanDetailFormModel } from '../data';
import { CreditInput, CreditOutput } from '@app/typings/calculator';
import { calculateAnnuity, calculateDifferential } from '@shared/utils';
import { buildRequiredAddresses, isFlowAddressFilled } from '../utils/address';
import { isFinDataFilled } from '@pages/application/utils/flow-step.validation';
import { mergeProductConditions } from '@api/utils';
import { OnlineApiService } from '@api/controllers/los';
import { ProductConditionItem, ProductItem } from '@api/models/los/product';

@Injectable()
export class LoanDetailService {
  private readonly onlineApiService = inject(OnlineApiService);

  public readonly isValidated = signal<boolean>(false);
  public readonly isLoading = signal<boolean>(true);
  public readonly isDisabled = signal<boolean>(true);
  public readonly productCondition = signal<ProductConditionItem>(null);

  public readonly form = form(signal({ ...loanDetailFormModel, addresses: buildRequiredAddresses() }), (schemaPath) => {
    min(schemaPath.amount, () => this.productCondition()?.minAmount ?? 0);
    max(schemaPath.amount, () => this.productCondition()?.maxAmount ?? 0);
    min(schemaPath.term, () => this.productCondition()?.minTerm ?? 0);
    max(schemaPath.term, () => this.productCondition()?.maxTerm ?? 0);
    required(schemaPath.dirCreditPurposeId);
    required(schemaPath.offer);
    validate(schemaPath.addresses, ({ value }) => (value().every(isFlowAddressFilled) ? null : requiredError()));
    validate(schemaPath.finData, ({ value }) => (isFinDataFilled(value()) ? null : requiredError()));
    disabled(schemaPath, () => this.isDisabled() || this.isLoading());
  });

  public readonly calculationResult = computed<CreditOutput>(() => {
    const { amount, term, type } = this.form;

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

  public applyProduct(product: ProductItem): void {
    const condition = mergeProductConditions(product.conditions);

    this.productCondition.set(condition);
    this.form().value.update((cur) => ({
      ...cur,
      amount: condition?.defaultAmount ?? condition?.minAmount ?? cur.amount,
      term: condition?.defaultTerm ?? condition?.minTerm ?? cur.term,
    }));
  }
}
