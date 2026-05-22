import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from 'src/environments/development';

export const headersInterceptor: HttpInterceptorFn = (req, next) => {
  if (environment.skipAuth) {
    return next(
      req.clone({
        setHeaders: {
          'X-Device-Type': environment.deviceType,
          'X-App-Version': '99.99.99',
          'X-Device-Root': '0',
        },
      }),
    );
  }

  const modifiedReq = req.clone({
    setHeaders: {
      'Api-Key': environment.apiKey,
      'Able-Module': environment.ablePlatform,
    },
  });

  return next(modifiedReq);
};
