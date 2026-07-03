import { inject } from '@angular/core';
import { ResolveFn, Router, UrlTree } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';
import { OnlineApiService } from '@api/controllers/los';
import { OnlineAccount } from '@api/models/los/account';
import { LoanRoute, RootRoute } from '@app/constants/route-path';

export const accountsResolver: ResolveFn<OnlineAccount[] | UrlTree> = (route) => {
  const api = inject(OnlineApiService);
  const router = inject(Router);

  const applicationId = route.params['applicationId'];

  return api.getAccounts$(applicationId).pipe(
    catchError(() => {
      void router.navigate(['/', RootRoute.Loan, LoanRoute.List]);
      return EMPTY;
    }),
  );
};
