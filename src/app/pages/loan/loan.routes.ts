import { Routes } from '@angular/router';
import { loanAdvantagesResolver, loanDocsResolver } from './resolvers';
import { checkLoanIdGuard } from '@core/guards';
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
    data: { title: 'Потоковое кредитование', backConfig: { link: '../list' } },
    resolve: { advantages: loanAdvantagesResolver, docs: loanDocsResolver },
    canActivate: [checkLoanIdGuard],
    loadComponent: () => import('./pages/loan-detail/loan-detail').then((c) => c.LoanDetail),
  },
  {
    path: '**',
    redirectTo: LoanRoute.List,
  },
];
