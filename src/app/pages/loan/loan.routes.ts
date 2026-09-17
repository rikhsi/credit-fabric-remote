import { Routes } from '@angular/router';
import { loanDocsResolver, loanProductsResolver } from './resolvers';
import { checkEligibilityGuard, checkLoanIdGuard } from './guards';
import { LoanProductsService } from './services';
import { LoanRoute } from '@app/constants/route-path';
import { RouteParam } from '@app/constants/route-param';

export const routes: Routes = [
  {
    path: '',
    providers: [LoanProductsService],
    resolve: { products: loanProductsResolver },
    children: [
      {
        path: LoanRoute.List,
        data: { title: 'prop.credits' },
        loadComponent: () => import('./pages/loan-list/loan-list').then((c) => c.LoanList),
      },
      {
        path: `${LoanRoute.Details}/:${RouteParam.LoanId}`,
        data: { title: 'prop.application_to_loan', backConfig: { link: '../list' } },
        resolve: { docs: loanDocsResolver },
        canActivate: [checkEligibilityGuard, checkLoanIdGuard],
        loadComponent: () => import('./pages/loan-detail/loan-detail').then((c) => c.LoanDetail),
      },
      {
        path: '**',
        redirectTo: LoanRoute.List,
      },
    ],
  },
];
