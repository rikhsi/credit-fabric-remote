import { inject } from '@angular/core';
import { ResolveFn, Router, UrlTree } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';
import { OnlineApiService } from '@api/controllers/los';
import { OnlineApplication } from '@api/models/los';
import { RootRoute } from '@constants';

export const applicationResolver: ResolveFn<OnlineApplication | UrlTree> = (route) => {
  const api = inject(OnlineApiService);
  const router = inject(Router);

  const applicationId = route.params['applicationId'];

  return api.getApplication$(applicationId).pipe(
    catchError(() => {
      void router.navigate(['/', RootRoute.Loan]);
      return EMPTY;
    }),
  );
};
