import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from 'src/environments/development';

export const headersInterceptor: HttpInterceptorFn = (req, next) => {
  const modifiedReq = req.clone({
    setHeaders: {
      'Able-Module': environment.ablePlatform,
      'X-Device-Type': environment.deviceType,
      'X-App-Version': environment.appVersion,
      'X-Device-Root': environment.deviceRoot,
    },
  });

  return next(modifiedReq);
};
