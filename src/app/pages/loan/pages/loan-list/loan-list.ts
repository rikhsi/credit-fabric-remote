import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { delay } from 'rxjs';
import { ProductApiService } from '@api/controllers/los';
import { CardProduct, NotEligible } from '@pages/loan/components';
import { EmptyListPipe, MonthsToYearsPipe } from '@shared/pipes';
import { ProductItem } from '@api/models/los/product';
import { ConditionAmountPipe, ConditionRatePipe, ConditionTermPipe } from '@pages/loan/pipes';
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
export class LoanList implements OnInit {
  private readonly productApiService = inject(ProductApiService);
  private readonly eligibilityService = inject(EligibilityService);
  private readonly destroyRef = inject(DestroyRef);

  public readonly isEligible = this.eligibilityService.isEligible;
  public readonly isLoading = signal(this.isEligible());
  public readonly items = signal<ProductItem[]>([]);

  ngOnInit(): void {
    if (!this.isEligible()) {
      return;
    }

    this.productApiService
      .getProducts$()
      .pipe(delay(300), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: ProductItem[]) => {
          this.items.set(res);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }
}
