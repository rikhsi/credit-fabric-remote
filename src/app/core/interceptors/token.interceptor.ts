import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from 'src/environments/development';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const accessToken: string = environment.proxyKey;

  const authReq = req.clone({
    setHeaders: {
      Authorization: `${accessToken}`,
    },
  });

  return next(authReq);
};
