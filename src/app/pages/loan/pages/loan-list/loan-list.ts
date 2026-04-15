import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProductApiService } from '@api/controllers/los';
import { ProductItem } from '@api/models/los';
import { CardProduct } from '@pages/loan/components';

@Component({
  selector: 'cf-loan-list',
  imports: [CardProduct],
  templateUrl: './loan-list.html',
  styleUrl: './loan-list.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoanList implements OnInit {
  private readonly productApiService = inject(ProductApiService);
  private readonly destroyRef = inject(DestroyRef);

  isLoading = signal<boolean>(true);
  items = signal<ProductItem[]>([]);

  ngOnInit(): void {
    this.productApiService
      .productsAll$()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ data }) => {
        this.items.set(data);
        this.isLoading.set(false);
      });
  }
}
