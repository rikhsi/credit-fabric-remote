import { inject, provideAppInitializer } from '@angular/core';
import { of, switchMap } from 'rxjs';
import { EligibilityService } from '@core/services/eligibility.service';
import { LoanProductsService } from '@core/services/loan-products.service';

export const provideLoanProducts = provideAppInitializer(() => {
  const eligibilityService = inject(EligibilityService);
  const productsService = inject(LoanProductsService);

  return eligibilityService.init$().pipe(
    switchMap((eligible) => {
      if (eligible) {
        return productsService.load$();
      }

      productsService.isLoading.set(false);

      return of([]);
    }),
  );
});
