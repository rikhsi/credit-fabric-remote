import { inject } from '@angular/core';
import { CanActivateFn, RedirectCommand, Router } from '@angular/router';
import { LoanRoute, RootRoute } from '@app/constants/route-path';
import { RouteParam } from '@app/constants/route-param';
import { LoanProductsService } from '@core/services/loan-products.service';

export const checkProductGuard: CanActivateFn = (route) => {
  const productsService = inject(LoanProductsService);
  const router = inject(Router);
  const loanId = route.paramMap.get(RouteParam.LoanId);

  if (loanId && productsService.getById(loanId)) {
    return true;
  }

  return new RedirectCommand(router.createUrlTree([RootRoute.Loan, LoanRoute.List]));
};
