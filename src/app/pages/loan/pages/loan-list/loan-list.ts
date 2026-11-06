import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { forkJoin } from 'rxjs';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { CardProduct, NotEligible, OutOfHours } from '@pages/loan/components';
import { EmptyListPipe, MonthsToYearsPipe } from '@shared/pipes';
import { Refresher, RefresherEvent } from '@shared/components';
import { ConditionAmountPipe, ConditionRatePipe, ConditionTermPipe } from '@pages/loan/pipes';
import { EligibilityService } from '@core/services/eligibility.service';
import { LoanBranchesService } from '@core/services/loan-branches.service';
import { LoanProductsService } from '@core/services/loan-products.service';
import { LoanDataService } from '@core/services/loan-data.service';

@Component({
  selector: 'cf-loan-list',
  imports: [
    CardProduct,
    NzSkeletonModule,
    EmptyListPipe,
    MonthsToYearsPipe,
    NotEligible,
    OutOfHours,
    ConditionAmountPipe,
    ConditionRatePipe,
    ConditionTermPipe,
    Refresher,
  ],
  templateUrl: './loan-list.html',
  styleUrl: './loan-list.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoanList {
  private readonly productsService = inject(LoanProductsService);
  private readonly branchesService = inject(LoanBranchesService);
  private readonly eligibilityService = inject(EligibilityService);
  private readonly loanDataService = inject(LoanDataService);

  public readonly isAvailable = computed(() => this.loanDataService.isAvailable());
  public readonly isEligible = computed(() => this.eligibilityService.isEligible());
  public readonly isLoading = computed(() => this.productsService.isLoading() || this.branchesService.isLoading());
  public readonly items = computed(() => this.productsService.items());

  onRefresh(event: RefresherEvent): void {
    event.complete();

    // Data reloads by itself once working hours start.
    if (!this.isAvailable()) {
      return;
    }

    this.productsService.isLoading.set(true);

    forkJoin([this.productsService.load$(), this.eligibilityService.refresh$()]).subscribe();
  }
}
