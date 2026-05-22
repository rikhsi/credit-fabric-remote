import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { LANGUAGE_CONTENT } from '@app/constants/language';

export const langInterceptor: HttpInterceptorFn = (req, next) => {
  const translocoService = inject(TranslocoService);

  const clonedRequest = req.clone({
    setHeaders: {
      'Accept-Language': LANGUAGE_CONTENT[translocoService.getActiveLang()],
    },
  });

  return next(clonedRequest);
};
