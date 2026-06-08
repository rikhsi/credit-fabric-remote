import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';

import { UserService } from '../services/user.service';

export const AuthorizedGuard: CanActivateFn = (route, state) => {
  const authService = inject(UserService);
  const router = inject(Router);
  return authService.userLoginData$.pipe(
    map((user) => {
      const authorized = user;
      if (!authorized) {
        return true;
      }
      return router.createUrlTree(['main']);
    })
  );
};
