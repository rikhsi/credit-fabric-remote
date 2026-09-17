import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { CardProduct, NotEligible } from '@pages/loan/components';
import { EmptyListPipe, MonthsToYearsPipe } from '@shared/pipes';
import { ConditionAmountPipe, ConditionRatePipe, ConditionTermPipe } from '@pages/loan/pipes';
import { LoanProductsService } from '@pages/loan/services';
import { EligibilityService } from '@core/services/eligibility.service';

@Component({
  selector: 'cf-loan-list',
  imports: [
    CardProduct,
    NzSkeletonModule,
    EmptyListPipe,
    MonthsToYearsPipe,
    NotEligible,
    ConditionAmountPipe,
    ConditionRatePipe,
    ConditionTermPipe,
  ],
  templateUrl: './loan-list.html',
  styleUrl: './loan-list.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoanList {
  private readonly productsService = inject(LoanProductsService);
  private readonly eligibilityService = inject(EligibilityService);

  public readonly isEligible = computed(() => this.eligibilityService.isEligible());
  public readonly isLoading = this.productsService.isLoading;
  public readonly items = this.productsService.items;
}
