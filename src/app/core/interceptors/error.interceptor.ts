import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { translate } from '@jsverse/transloco';
import { catchError, throwError } from 'rxjs';
import { IS_TOKEN_RETRY, SHOW_ERROR_NOTIFICATION } from '@app/constants/base';
import { TokenRefreshService } from '@core/services/token-refresh.service';
import { ToastService } from '@core/services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const tokenRefreshService = inject(TokenRefreshService);
  const showError = req.context.get(SHOW_ERROR_NOTIFICATION);

  return next(req).pipe(
    catchError((result: HttpErrorResponse) => {
      if (result.status === 401 || result.status === 403) {
        if (req.context.get(IS_TOKEN_RETRY) || tokenRefreshService.consumeRefreshFailed()) {
          toast.error(translate('auth.error.session.title'), translate('auth.error.session.restart'));
        }

        return throwError(() => result);
      }

      if (result.status === 0) {
        // authService.logout();
      }

      if (!showError) {
        return throwError(() => result);
      }

      const { error, message } = result.error ?? {};

      toast.error(error ?? 'Error', message ?? 'Unknown error');

      return throwError(() => result);
    }),
  );
};
