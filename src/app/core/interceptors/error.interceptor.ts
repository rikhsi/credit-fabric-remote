import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { catchError, throwError } from 'rxjs';
import { CoreError, SHOW_ERROR_NOTIFICATION } from '@constants';
import { AuthService } from '@core/services';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notification = inject(NzNotificationService);
  const showError = req.context.get(SHOW_ERROR_NOTIFICATION);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((result: HttpErrorResponse) => {
      if (result.status === 401 || result.status === 403) {
        authService.logout();
      }

      if (!showError) {
        return throwError(() => error);
      }

      const { error, message } = result.error as CoreError;

      notification.error(`${error}`, message);

      return throwError(() => result);
    }),
  );
};
