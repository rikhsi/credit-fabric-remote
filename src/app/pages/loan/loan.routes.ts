import { Routes } from '@angular/router';
import { checkEligibilityGuard, checkProductGuard } from './guards';
import { LoanRoute } from '@app/constants/route-path';
import { RouteParam } from '@app/constants/route-param';

export const routes: Routes = [
  {
    path: LoanRoute.List,
    data: { title: 'prop.credits' },
    loadComponent: () => import('./pages/loan-list/loan-list').then((c) => c.LoanList),
  },
  {
    path: `${LoanRoute.Details}/:${RouteParam.LoanId}`,
    data: { title: 'prop.loan_application_submit', backConfig: { link: '../list' } },
    canActivate: [checkEligibilityGuard, checkProductGuard],
    loadComponent: () => import('./pages/loan-detail/loan-detail').then((c) => c.LoanDetail),
  },
  {
    path: '**',
    redirectTo: LoanRoute.List,
  },
];
