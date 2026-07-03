import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, of } from 'rxjs';
import { OnlineApiService } from '@api/controllers/los';
import { OnlineAccount } from '@api/models/los/account';

export const accountsResolver: ResolveFn<OnlineAccount[]> = (route) => {
  const api = inject(OnlineApiService);

  const applicationId = route.params['applicationId'];

  return api.getAccounts$(applicationId).pipe(catchError(() => of<OnlineAccount[]>([])));
};
