import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from 'src/environments/development';

export const headersInterceptor: HttpInterceptorFn = (req, next) => {
  const modifiedReq = req.clone({
    setHeaders: {
      'Api-Key': environment.apiKey,
      'Able-Module': environment.ablePlatform,
    },
  });

  return next(modifiedReq);
};
