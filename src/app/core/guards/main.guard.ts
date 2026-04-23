import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, of } from 'rxjs';
import { RootRoute } from '@constants';
import { AuthService } from '@core/services';

export const mainGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated) {
    return router.createUrlTree([RootRoute.Auth]);
  }

  return of(authService.user()).pipe(map(() => true));
};
