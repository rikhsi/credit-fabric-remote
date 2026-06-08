import {
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { inject } from '@angular/core';
import { tap, catchError, throwError } from 'rxjs';
import { FirebaseAnalyticsService } from '../../../../firebase-analytics.service';

export const apiDurationInterceptor: HttpInterceptorFn = (request: HttpRequest<unknown>, next) => {
  if (!request.url.includes('/api/') || request.url.includes('/refresh-token')) {
    return next(request);
  }

  const analyticsService = inject(FirebaseAnalyticsService);
  const startTime = Date.now();
  const url = request.url;
  let endpoint = ''
  const match =  url.match(/\/api\/(.+)/);
  if (match) {
    endpoint =  match[1]
  } else {
    endpoint =  url
  }

  const logDuration = (http_status: string) => {
    const duration_ms = Date.now() - startTime;
    analyticsService.logFirebaseCustomEvent('api_duration', {
      platform: 'web',
      endpoint,
      duration_ms,
      http_status
    });
  };

  return next(request).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        logDuration(String(event.status));
      }
    }),
    catchError((error) => {
      const status = error?.status != null ? String(error.status) : '';
      logDuration(status);
      return throwError(() => error);
    })
  );
};
