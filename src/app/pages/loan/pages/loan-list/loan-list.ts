import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { delay } from 'rxjs';
import { ProductApiService } from '@api/controllers/los';
import { CardProduct } from '@pages/loan/components';
import { filterEnableLoans } from '@pages/loan/utils';
import { EmptyListPipe } from '@shared/pipes';
import { ProductItem } from '@api/models/los/product';

@Component({
  selector: 'cf-loan-list',
  imports: [CardProduct, NzSkeletonModule, EmptyListPipe],
  templateUrl: './loan-list.html',
  styleUrl: './loan-list.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoanList implements OnInit {
  private readonly productApiService = inject(ProductApiService);
  private readonly destroyRef = inject(DestroyRef);

  public readonly isLoading = signal<boolean>(true);
  public readonly items = signal<ProductItem[]>([]);

  ngOnInit(): void {
    this.productApiService
      .productsAll$()
      .pipe(delay(300), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.isLoading.set(false);

          this.items.set(filterEnableLoans(res?.data ?? []));
        },
      });
  }
}
