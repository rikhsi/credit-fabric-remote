import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';

import { UserService } from '../services/user.service';

export const PermissionGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);
  return userService.userLoginData$$.pipe(
    map((user) => {
      const requiredPermissions = route.data['permissions'] as Array<string>;
      const mode = route.data['mode'] as string;
      let hasPermission: boolean;
      if(mode !== 'all') {
        hasPermission = requiredPermissions
          .some(perm => user?.permissionWindow.includes(perm));
      } else {
        hasPermission = requiredPermissions
          .every(perm => user?.permissionWindow.includes(perm));
      }

      if (!hasPermission) {
        router.navigate(['/main']);
        return false;
      }

      return true;
    })
  );
};
