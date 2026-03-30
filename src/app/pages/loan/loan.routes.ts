import { Routes } from '@angular/router';
import { LoanRoute, RouteParam } from '@constants';

export const routes: Routes = [
  {
    path: LoanRoute.List,
    data: { title: 'pages.loan.list.title' },
    loadComponent: () => import('./pages/loan-list/loan-list').then((c) => c.LoanList),
  },
  {
    path: `${LoanRoute.Details}/:${RouteParam.LoanId}`,
    data: { title: 'pages.loan.detail.title' },
    loadComponent: () => import('./pages/loan-detail/loan-detail').then((c) => c.LoanDetail),
  },
  {
    path: '**',
    redirectTo: LoanRoute.List,
  },
];
