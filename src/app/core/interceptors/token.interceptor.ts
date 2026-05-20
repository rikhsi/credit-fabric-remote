import { inject } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { HttpInterceptorFn } from '@angular/common/http';
import { LocalStorageService } from '@core/services';
import { LocalStorageItem } from '@constants';
import { environment } from 'src/environments/development';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const storageService = inject(LocalStorageService);
  const tokenService = inject(JwtHelperService);

  const accessToken: string = storageService.getItem(LocalStorageItem.AccessToken);

  if (environment.skipAuth) {
    return next(req);
  } else {
    const isExpired = tokenService.isTokenExpired(accessToken);

    if (isExpired) {
      return next(req);
    }

    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return next(authReq);
  }
};
