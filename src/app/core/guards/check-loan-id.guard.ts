import { inject } from '@angular/core';
import { CanActivateFn, RedirectCommand, Router } from '@angular/router';
import { ENABLE_LOAN_IDS } from '@app/constants/loan';
import { RouteParam } from '@app/constants/route-param';
import { LoanRoute } from '@app/constants/route-path';

export const checkLoanIdGuard: CanActivateFn = ({ params }) => {
  const router = inject(Router);

  const loanId = params[RouteParam.LoanId];
  const isEnable = ENABLE_LOAN_IDS.includes(loanId);

  if (isEnable) {
    return true;
  }

  return new RedirectCommand(router.createUrlTree([LoanRoute.List]));
};
