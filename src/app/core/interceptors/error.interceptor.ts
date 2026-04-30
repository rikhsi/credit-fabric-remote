import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { catchError, throwError } from 'rxjs';
import { SHOW_ERROR_NOTIFICATION } from '@constants';
import { AuthService } from '@core/services';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notification = inject(NzNotificationService);
  const showError = req.context.get(SHOW_ERROR_NOTIFICATION);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((result: HttpErrorResponse) => {
      // 🔐 auth errors
      if (result.status === 401 || result.status === 403) {
        // authService.logout();
      }

      // 🌐 CORS / network error
      if (result.status === 0) {
        // authService.logout();
      }

      // ❌ отключены ошибки
      if (!showError) {
        return throwError(() => result);
      }

      // 💥 backend error
      const { error, message } = result.error ?? {};

      notification.error(error ?? 'Error', message ?? 'Unknown error');

      return throwError(() => result);
    }),
  );
};
