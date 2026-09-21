import { computed, inject, Injectable, signal } from '@angular/core';
import { disabled, form, max, min, required, requiredError, validate } from '@angular/forms/signals';
import { tap } from 'rxjs';
import { agreementFormModel, loanDetailFormModel } from '../data';
import { isFlowAddressFilled } from '../utils/address';
import { CreditInput, CreditOutput } from '@app/typings/calculator';
import { calculateAnnuity, calculateDifferential } from '@shared/utils';
import { isFinDataFilled } from '@pages/loan/utils/finance';
import { mergeProductConditions } from '@api/utils';
import { OnlineApiService } from '@api/controllers/los';
import { ProductConditionItem, ProductItem } from '@api/models/los/product';
import { buildStartProcessingPayload } from '@pages/loan/utils/finance-months';

@Injectable()
export class LoanDetailService {
  private readonly onlineApiService = inject(OnlineApiService);

  public readonly isValidated = signal<boolean>(false);
  public readonly isLoading = signal<boolean>(true);
  public readonly isDisabled = signal<boolean>(true);
  public readonly productCondition = signal<ProductConditionItem>(null);

  public readonly form = form(signal({ ...loanDetailFormModel }), (schemaPath) => {
    min(schemaPath.loanAmount, () => this.productCondition()?.minAmount ?? 0);
    max(schemaPath.loanAmount, () => this.productCondition()?.maxAmount ?? 0);
    min(schemaPath.loanTerm, () => this.productCondition()?.minTerm ?? 0);
    max(schemaPath.loanTerm, () => this.productCondition()?.maxTerm ?? 0);
    validate(schemaPath.addresses, ({ value }) => (isFlowAddressFilled(value()) ? null : requiredError()));
    validate(schemaPath.finData, ({ value }) => (isFinDataFilled(value()) ? null : requiredError()));
    disabled(schemaPath, () => this.isDisabled() || this.isLoading());
  });

  /** Kept apart from the main form: the offer is only a front-end guard and never reaches the API. */
  public readonly agreementForm = form(signal({ ...agreementFormModel }), (schemaPath) => {
    required(schemaPath.offer);
    validate(schemaPath.offer, ({ value }) => (value() ? null : requiredError()));
    disabled(schemaPath, () => this.isDisabled() || this.isLoading());
  });

  public readonly calculationResult = computed<CreditOutput>(() => {
    const { loanAmount, loanTerm, sysPaymentTypeId } = this.form;

    const input: CreditInput = {
      amount: loanAmount().value(),
      term: loanTerm().value(),
      annualRate: this.productCondition()?.interestRate,
    };

    if (sysPaymentTypeId().value() === 'annuity') {
      return calculateAnnuity(input);
    }

    return calculateDifferential(input);
  });

  public checkValidate$() {
    return this.onlineApiService.checkValidated$().pipe(tap(({ isOtpValidated }) => this.isValidated.set(isOtpValidated)));
  }

  public startProcessing$() {
    return this.onlineApiService.startProcessing$(buildStartProcessingPayload(this.form().value()));
  }

  public applyProduct(product: ProductItem): void {
    const condition = mergeProductConditions(product.conditions);

    this.productCondition.set(condition);
    this.form().value.update((cur) => ({
      ...cur,
      loanAmount: condition?.defaultAmount ?? condition?.minAmount ?? cur.loanAmount,
      loanTerm: condition?.defaultTerm ?? condition?.minTerm ?? cur.loanTerm,
    }));
  }
}
