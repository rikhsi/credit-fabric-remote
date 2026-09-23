import { inject, provideAppInitializer } from '@angular/core';
import { of, switchMap, tap } from 'rxjs';
import { EligibilityService } from '@core/services/eligibility.service';
import { LoanBranchesService } from '@core/services/loan-branches.service';

export const provideLoanBranches = provideAppInitializer(() => {
  const eligibilityService = inject(EligibilityService);
  const branchesService = inject(LoanBranchesService);

  return eligibilityService.init$().pipe(
    switchMap((eligible) => {
      if (!eligible) {
        branchesService.isLoading.set(false);

        return of([]);
      }

      return branchesService.load$().pipe(
        tap((options) => {
          // Request failure or served codes with no handbook match → not eligible.
          if (options == null || !options.length) {
            eligibilityService.isEligible.set(false);
          }
        }),
      );
    }),
  );
});
