import { inject } from '@angular/core';
import { CanActivateFn, RedirectCommand, Router } from '@angular/router';
import { LoanRoute, RootRoute } from '@app/constants/route-path';
import { EligibilityService } from '@core/services/eligibility.service';

export const checkEligibilityGuard: CanActivateFn = () => {
  const eligibilityService = inject(EligibilityService);
  const router = inject(Router);

  if (eligibilityService.isEligible()) {
    return true;
  }

  return new RedirectCommand(router.createUrlTree([RootRoute.Loan, LoanRoute.List]));
};
