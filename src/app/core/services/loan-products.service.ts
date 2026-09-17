import { inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, of, tap } from 'rxjs';
import { ProductApiService } from '@api/controllers/los';
import { ProductItem } from '@api/models/los/product';

@Injectable({ providedIn: 'root' })
export class LoanProductsService {
  private readonly productApiService = inject(ProductApiService);

  public readonly items = signal<ProductItem[]>([]);
  public readonly isLoading = signal(true);

  public load$() {
    return this.productApiService.getProducts$().pipe(
      tap((items) => this.items.set(items)),
      catchError(() => {
        this.items.set([]);
        this.isLoading.set(false)

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
