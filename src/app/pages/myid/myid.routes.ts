import { Routes } from '@angular/router';
import { LoanRoute, RootRoute } from '@app/constants/route-path';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'prop.loan_application_submit',
      backConfig: { link: ['/', RootRoute.Loan, LoanRoute.List] },
    },
    loadComponent: () => import('./pages/myid/myid').then((c) => c.MyId),
  },
];
