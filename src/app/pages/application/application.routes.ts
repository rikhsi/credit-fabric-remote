import { Routes } from '@angular/router';
import { FlowService } from './services';
import { applicationFlowFinanceGuard } from './guards/application-flow-finance.guard';
import { applicationFlowOneIdGuard } from './guards/application-flow-one-id.guard';
import { accountsResolver, applicationResolver, financeResolver } from './resolvers';
import { ApplicationFlowRoute, ApplicationRoute, LoanRoute, RootRoute } from '@app/constants/route-path';
import { RouteParam } from '@app/constants/route-param';

export const routes: Routes = [
  {
    path: `${ApplicationRoute.Flow}/:${RouteParam.AppId}`,
    providers: [FlowService],
    resolve: {
      application: applicationResolver,
      accounts: accountsResolver,
    },
    children: [
      {
        path: ApplicationFlowRoute.General,
        data: {
          title: 'prop.application_to_loan',
          backConfig: { link: ['/', RootRoute.Loan, LoanRoute.Details, ApplicationRoute.Flow] },
        },
        loadComponent: () => import('./pages/flow/a-flow-general/a-flow-general').then((c) => c.AFlowGeneral),
      },
      {
        path: ApplicationFlowRoute.Finance,
        canActivate: [applicationFlowFinanceGuard],
        resolve: {
          backConfig: financeResolver,
        },
        data: {
          title: 'prop.application_to_loan',
        },
        loadComponent: () => import('./pages/flow/a-flow-finance/a-flow-finance').then((c) => c.AFlowFinance),
      },
      {
        path: ApplicationFlowRoute.OneId,
        canActivate: [applicationFlowOneIdGuard],
        data: {
          title: 'prop.application_to_loan',
        },
        loadComponent: () => import('./pages/flow/a-flow-one-id/a-flow-one-id').then((c) => c.AFlowOneId),
      },
      {
        path: '**',
        redirectTo: ApplicationFlowRoute.General,
      },
    ],
  },
  {
    path: '**',
    redirectTo: '/loan/list',
  },
];
