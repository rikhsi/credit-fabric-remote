import { Routes } from '@angular/router';
import { LoanRoute, RouteParam } from '@constants';

export const routes: Routes = [
  {
    path: LoanRoute.List,
    data: { title: 'Кредиты' },
    loadComponent: () => import('./pages/loan-list/loan-list').then((c) => c.LoanList),
  },
  {
    path: `${LoanRoute.Details}/:${RouteParam.LoanId}`,
    data: { title: 'Потоковое кредитование' },
    loadComponent: () => import('./pages/loan-detail/loan-detail').then((c) => c.LoanDetail),
  },
  {
    path: '**',
    redirectTo: LoanRoute.List,
  },
];
