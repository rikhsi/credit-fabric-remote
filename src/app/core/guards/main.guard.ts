import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of, tap } from 'rxjs';
import { UserApiService } from '@api/controllers/base';
import { RootRoute } from '@constants';
import { AuthService } from '@core/services';

export const mainGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const userApi = inject(UserApiService);
  const router = inject(Router);

  if (!authService.isAuthenticated) {
    return router.createUrlTree([RootRoute.Auth]);
  }

  return userApi.getCurrent$().pipe(
    tap((user) => authService.user.set(user)),
    map(() => true),
    catchError(() => of(router.createUrlTree([RootRoute.Auth]))),
  );
};
