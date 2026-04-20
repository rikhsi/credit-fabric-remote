import { Routes } from '@angular/router';
import { LoanRoute, RouteParam } from '@constants';
import { checkLoanIdGuard } from '@core/guards';

export const routes: Routes = [
  {
    path: LoanRoute.List,
    data: { title: 'prop.credits' },
    loadComponent: () => import('./pages/loan-list/loan-list').then((c) => c.LoanList),
  },
  {
    path: `${LoanRoute.Details}/:${RouteParam.LoanId}`,
    data: { title: 'Потоковое кредитование', backConfig: { link: '../list' } },
    canActivate: [checkLoanIdGuard],
    loadComponent: () => import('./pages/loan-detail/loan-detail').then((c) => c.LoanDetail),
  },
  {
    path: '**',
    redirectTo: LoanRoute.List,
  },
];
