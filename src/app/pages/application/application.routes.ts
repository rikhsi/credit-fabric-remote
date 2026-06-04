import { Routes } from '@angular/router';
import { applicationFlowGeneralGuard } from './guards/application-flow-general.guard';
import { FlowService } from './services';
import { applicationResolver, financeResolver } from './resolvers';
import { ApplicationFlowRoute, ApplicationRoute, LoanRoute, RootRoute } from '@app/constants/route-path';
import { RouteParam } from '@app/constants/route-param';

export const routes: Routes = [
  {
    path: `${ApplicationRoute.Flow}/:${RouteParam.AppId}`,
    providers: [FlowService],
    resolve: {
      application: applicationResolver,
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
        canActivate: [applicationFlowGeneralGuard],
        resolve: {
          backConfig: financeResolver,
        },
        data: {
          title: 'prop.application_to_loan',
        },
        loadComponent: () => import('./pages/flow/a-flow-finance/a-flow-finance').then((c) => c.AFlowFinance),
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
