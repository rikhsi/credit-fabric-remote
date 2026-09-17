import { inject, provideAppInitializer } from '@angular/core';
import { switchMap } from 'rxjs';
import { EligibilityService } from '@core/services/eligibility.service';
import { LoanProductsService } from '@pages/loan/services';

export const provideLoanProducts = provideAppInitializer(() => {
  const eligibilityService = inject(EligibilityService);
  const productsService = inject(LoanProductsService);

  return eligibilityService.init$().pipe(switchMap(() => productsService.load$()));
});
