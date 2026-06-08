// interceptors/token-refresh.interceptor.ts
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError, BehaviorSubject, EMPTY } from 'rxjs';
import { catchError, filter, take, switchMap, tap, finalize, timeout } from 'rxjs/operators';
import { UserService } from '../services/user.service';
import { AuthService } from 'src/app/views/auth/services/auth.service';
import { BackendResponse } from '../models/backend-response.model';
import { UserDataDto } from '../models/user.model';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const tokenRefreshInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const userService = inject(UserService);
  if (req.url.includes('/refresh-token')) {
    return next(req);
  }

  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        const body = event.body as BackendResponse<unknown>;
        if (
          body?.success === false &&
          isStatusAllowedForRefreshToken(body.result?.code || 0) &&
          userService.getRefreshToken()
        ) {
          throw { __triggerRefresh: true, originalRequest: req };
        }
      }
    }),
    catchError((error) => {
      if (error?.__triggerRefresh) {

        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null);

          const refreshToken = userService.getRefreshToken()!;
          const token = userService.getToken()!;

          authService.refreshToken({ accessToken: token, refreshToken }).pipe(
            switchMap((response: UserDataDto | null) => {
              if (!response?.accessToken) {
                throw new Error('No token received from refresh');
              }

              userService.setUserData(response, true);
              userService.setToken(response.accessToken);

              // Notify all waiting requests
              refreshTokenSubject.next(response.accessToken);

              return EMPTY;
            }),
            catchError((err) => {
              refreshTokenSubject.error(err);
              userService.logout();
              return EMPTY;
            }),
            finalize(() => {
              isRefreshing = false;
            })
          ).subscribe();
        }
        return refreshTokenSubject.pipe(
          filter((token) => token !== null),
          take(1),
          timeout(30000),
          switchMap((newToken) => {
            const clonedReq = req.clone({
              setHeaders: { 'x-auth-token': newToken! },
            });

            return next(clonedReq);
          }),
          catchError((refreshError) => {
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};

function isStatusAllowedForRefreshToken(code: number): boolean {
  return [40100, 401, 30401, 41000, 40101, 20401].includes(code);
}
