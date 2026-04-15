import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { USE_HTTP_CACHE } from '@constants';
import { CacheService } from '@core/services';

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  const cache = inject(CacheService);

  if (req.method !== 'GET') {
    return next(req);
  }

  if (!req.context.get(USE_HTTP_CACHE)) {
    return next(req);
  }

  const key = req.urlWithParams;

  return cache.get(key, () => next(req));
};
