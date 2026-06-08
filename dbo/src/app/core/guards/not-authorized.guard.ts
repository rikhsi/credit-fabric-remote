import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {map} from 'rxjs';

import {UserService} from '../services/user.service';

export const NotAuthorizedGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);
  return userService.userLoginData$.pipe(
    map((user) => {
      const notAuthorized = !!user;
      if (notAuthorized) {
        return true;
      }
      return router.createUrlTree(['auth']);
    })
  );
};


export function canActivateGuard(moduleName: string): CanActivateFn {
  return () => {
    const userService = inject(UserService);
    const router = inject(Router);

    const permissions = userService.getPermissions();
    const hasAccess = permissions
      ? JSON.parse(permissions).some((p) => p.module === moduleName)
      : false;

    return !!hasAccess;


  };
}

export function canViewForCodeGuard(code: string): CanActivateFn {
  return () => {
    const prodHosts = [
      'biznes.hamkorbank.uz',
      'corp.hamkorbank.uz'
    ];

    if (!prodHosts.includes(window.location.hostname)) {
      return true;
    }

    const info = localStorage.getItem('businessInfo');
    if (!info) return false;

    try {
      return JSON.parse(info)?.clientCode === code;
    } catch {
      return false;
    }
  };
}
