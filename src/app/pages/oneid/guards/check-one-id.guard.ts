import { inject } from '@angular/core';
import { CanActivateFn, RedirectCommand, Router } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';
import { OnlineApiService } from '@api/controllers/los';
import { LoanRoute, RootRoute } from '@app/constants/route-path';
import { LoanDraftService } from '@core/services/loan-draft.service';
import { ToastService } from '@core/services/toast.service';
import { isStartProcessingPayloadFilled, showApplicationErrorToast, showApplicationSuccessToast } from '@pages/loan/utils';

/**
 * The page only makes sense in the middle of an application flow:
 * without a complete draft there is nothing to submit, and with the permission already granted there is nothing to ask for.
 */
export const checkOneIdGuard: CanActivateFn = () => {
  const loanDraft = inject(LoanDraftService);
  const onlineApiService = inject(OnlineApiService);
  const toast = inject(ToastService);
  const router = inject(Router);

  const toLoanList = () => new RedirectCommand(router.createUrlTree(['/', RootRoute.Loan, LoanRoute.List]));
  const toApplications = () => new RedirectCommand(router.createUrlTree(['/', RootRoute.Applications]));
  const draft = loanDraft.read();

  if (!isStartProcessingPayloadFilled(draft)) {
    return toLoanList();
  }

  return onlineApiService.checkOneId$().pipe(
    switchMap((granted) => {
      if (!granted) {
        return of(true);
      }

      return onlineApiService.startProcessing$(draft).pipe(
        map(() => {
          loanDraft.clear();
          showApplicationSuccessToast(toast);

          return toApplications();
        }),
        catchError((error) => {
          loanDraft.clear();
          showApplicationErrorToast(toast, error);

          return of(toApplications());
        }),
      );
    }),
    catchError(() => {
      loanDraft.clear();
      showApplicationErrorToast(toast);

      return of(toApplications());
    }),
  );
};
