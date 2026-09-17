import { inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, of, tap } from 'rxjs';
import { ProductApiService } from '@api/controllers/los';
import { ProductItem } from '@api/models/los/product';
import { EligibilityService } from '@core/services/eligibility.service';

@Injectable()
export class LoanProductsService {
  private readonly productApiService = inject(ProductApiService);
  private readonly eligibilityService = inject(EligibilityService);

  public readonly items = signal<ProductItem[]>([]);
  public readonly isLoading = signal(true);

  public load$() {
    if (!this.eligibilityService.isEligible()) {
      this.items.set([]);
      this.isLoading.set(false);

      return of<ProductItem[]>([]);
    }

    this.isLoading.set(true);

    return this.productApiService.getProducts$().pipe(
      tap((items) => this.items.set(items)),
      catchError(() => {
        this.items.set([]);

        return of<ProductItem[]>([]);
      }),
      finalize(() => this.isLoading.set(false)),
    );
  }

  public getById(productId: string): ProductItem | undefined {
    const id = productId.toLowerCase();

    return this.items().find((item) => item.id.toLowerCase() === id);
  }
}
