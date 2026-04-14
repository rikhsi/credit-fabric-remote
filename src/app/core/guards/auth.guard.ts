import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RootRoute } from '@constants';
import { AuthService } from '@core/services';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated) {
    return router.createUrlTree([RootRoute.Loan]);
  }

  return !authService.isAuthenticated;
};
