import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { IS_TOKEN_RETRY } from '@app/constants/base';
import { BridgeService } from '@core/services/bridge.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const bridgeService = inject(BridgeService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isUnauthorized = error.status === 401;
      const isRetry = req.context.get(IS_TOKEN_RETRY);

      if (!isUnauthorized || isRetry || !bridgeService.hasBridge()) {
        return throwError(() => error);
      }

      return from(bridgeService.refreshToken()).pipe(
        switchMap((isRefreshed) => {
          if (!isRefreshed) {
            return throwError(() => error);
          }

          const retryReq = req.clone({
            context: req.context.set(IS_TOKEN_RETRY, true),
          });

          return next(retryReq);
        }),
      );
    }),
  );
};
