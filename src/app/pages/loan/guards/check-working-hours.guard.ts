import { inject } from '@angular/core';
import { CanActivateFn, RedirectCommand, Router } from '@angular/router';
import { LoanRoute, RootRoute } from '@app/constants/route-path';
import { WorkingHoursService } from '@core/services/working-hours.service';

export const checkWorkingHoursGuard: CanActivateFn = () => {
  const workingHoursService = inject(WorkingHoursService);
  const router = inject(Router);

  if (workingHoursService.check()) {
    return true;
  }

  return new RedirectCommand(router.createUrlTree([RootRoute.Loan, LoanRoute.List]));
};
