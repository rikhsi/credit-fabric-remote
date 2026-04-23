import { computed, inject, Injectable, signal } from '@angular/core';
import { disabled, form, max, min, required } from '@angular/forms/signals';
import { map, tap } from 'rxjs';
import { agreementFormModel, calculatorFormModel } from '../data';
import { CreditInput, CreditOutput } from '@app/typings/calculator';
import { calculateAnnuity, calculateDifferential } from '@shared/utils';
import { OnlineApiService, ProductApiService } from '@api/controllers/los';
import { ProductConditionItem } from '@api/models/los';
import { mergeProductConditions } from '@api/utils';

@Injectable()
export class LoanDetailService {
  private onlineApiService = inject(OnlineApiService);
  private productApiService = inject(ProductApiService);

  public readonly isValidated = signal<boolean>(false);
  public readonly isLoading = signal<boolean>(true);
  public readonly productCondition = signal<ProductConditionItem>(null);

  public readonly calculatorForm = form(signal(calculatorFormModel), (schemaPath) => {
    min(schemaPath.amount, () => this.productCondition()?.min_amount ?? 0);
    max(schemaPath.amount, () => this.productCondition()?.max_amount ?? 0);
    min(schemaPath.term, () => this.productCondition()?.min_term ?? 0);
    max(schemaPath.term, () => this.productCondition()?.max_term ?? 0);
    disabled(schemaPath, () => this.isLoading());
  });

  public readonly agreementForm = form(signal(agreementFormModel), (schemaPath) => {
    required(schemaPath.offer);
    disabled(schemaPath, () => this.isLoading());
  });

  public readonly calculationResult = computed<CreditOutput>(() => {
    const { amount, term, type } = this.calculatorForm;

    const input: CreditInput = {
      amount: amount().value(),
      term: term().value(),
      annualRate: this.productCondition()?.interest_rate,
    };

    if (type().value() === 'annuity') {
      return calculateAnnuity(input);
    }

    return calculateDifferential(input);
  });

  public checkValidate$(pinfl: string) {
    return this.onlineApiService.checkValidated$(pinfl).pipe(tap(({ is_otp_validated }) => this.isValidated.set(is_otp_validated)));
  }

  public getCondition$(productId: string) {
    this.isLoading.set(true);

    return this.productApiService.productCondition$({ fk_entity_id: productId.toUpperCase() }).pipe(
      map(({ data }) => data.filter((d) => d.product_id === productId.toUpperCase())),
      tap({
        next: (data) => {
          const merged = mergeProductConditions(data);

          this.productCondition.set(merged);

          this.calculatorForm().value.update((cur) => ({
            ...cur,
            amount: merged?.max_amount,
            term: merged?.max_term,
          }));
        },
      }),
    );
  }
}
