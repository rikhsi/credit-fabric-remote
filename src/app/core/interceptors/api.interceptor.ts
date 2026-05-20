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
    case 'core':
      baseUrl = environment.coreUrl;
      break;

    case 'handbook':
      baseUrl = environment.handbookUrl;
      break;

    default:
      baseUrl = environment.losUrl;
  }

  const updatedReq = req.clone({
    url: `${baseUrl}${req.url}`,
    withCredentials: !environment.skipAuth,
  });

  return next(updatedReq);
};
