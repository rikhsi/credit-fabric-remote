import { Routes } from '@angular/router';
import { checkOneIdGuard } from './guards';
import { LoanRoute, RootRoute } from '@app/constants/route-path';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'prop.loan_application_submit',
      backConfig: { link: ['/', RootRoute.Loan, LoanRoute.List] },
    },
    canActivate: [checkOneIdGuard],
    loadComponent: () => import('./pages/oneid/oneid').then((c) => c.OneId),
  },
];
