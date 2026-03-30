import { HttpInterceptorFn } from '@angular/common/http';
import { QUEUE_TYPE } from '@constants';
import { environment } from 'src/environments/development';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('i18n')) {
    return next(req);
  }

  const apiType = req.context.get(QUEUE_TYPE);

  let baseUrl: string;

  switch (apiType) {
    default:
      baseUrl = environment.coreUrl;
  }

  const updatedReq = req.clone({
    url: `${baseUrl}${req.url}`,
  });

  return next(updatedReq);
};
