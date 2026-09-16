import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { delay, of, switchMap, tap } from 'rxjs';
import { OnlineApiService, ProductApiService } from '@api/controllers/los';
import { CardProduct, NotEligible } from '@pages/loan/components';
import { EmptyListPipe, MonthsToYearsPipe } from '@shared/pipes';
import { ProductItem } from '@api/models/los/product';
import { ConditionAmountPipe, ConditionRatePipe, ConditionTermPipe } from '@pages/loan/pipes';
import { HttpErrorResponse } from '@angular/common/http';

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
  private readonly onlineApiService = inject(OnlineApiService);
  private readonly destroyRef = inject(DestroyRef);

  public readonly isLoading = signal<boolean>(true);
  public readonly isEligible = signal<boolean>(false);
  public readonly items = signal<ProductItem[]>([]);

  ngOnInit(): void {
    this.onlineApiService
      .checkEligibility$()
      .pipe(
        delay(300),
        tap({
          next: ({ eligible }) => {
            this.isEligible.set(eligible);
          },
          error: (err: HttpErrorResponse) => {
            this.isEligible.set(err.error['eligible']);
          },
        }),
        switchMap(({ eligible }) => {
          if (eligible) {
            return this.productApiService.getProducts$().pipe(tap((res) => this.items.set(res)));
          }

          return of([]);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.isLoading.set(false);
      });
  }
}
