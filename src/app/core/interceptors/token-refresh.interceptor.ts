import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { IS_TOKEN_RETRY } from '@app/constants/base';
import { BridgeService } from '@core/services/bridge.service';
import { TokenRefreshService } from '@core/services/token-refresh.service';

export const tokenRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenRefreshService = inject(TokenRefreshService);
  const bridgeService = inject(BridgeService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isUnauthorized = error.status === 401;
      const isRetry = req.context.get(IS_TOKEN_RETRY);

      if (!isUnauthorized || isRetry || !bridgeService.hasBridge()) {
        return throwError(() => error);
      }

      const retryReq = req.clone({
        context: req.context.set(IS_TOKEN_RETRY, true),
      });

      if (!tokenRefreshService.isRefreshing) {
        tokenRefreshService.startRefresh();
        bridgeService.refreshToken();
      }

      return tokenRefreshService.waitForRefresh().pipe(switchMap((success) => (success ? next(retryReq) : throwError(() => error))));
    }),
  );
};
