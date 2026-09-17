import { Routes } from '@angular/router';
import { loanDocsResolver } from './resolvers';
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
    data: { title: 'prop.application_to_loan', backConfig: { link: '../list' } },
    resolve: { docs: loanDocsResolver },
    canActivate: [checkEligibilityGuard, checkProductGuard],
    loadComponent: () => import('./pages/loan-detail/loan-detail').then((c) => c.LoanDetail),
  },
  {
    path: '**',
    redirectTo: LoanRoute.List,
  },
];
