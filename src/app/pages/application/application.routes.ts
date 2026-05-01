import { Routes } from '@angular/router';
import { FlowService } from './services';
import { ApplicationRoute, ApplicationFlowRoute } from '@constants';

export const routes: Routes = [
  {
    path: ApplicationRoute.Flow,
    providers: [FlowService],
    children: [
      {
        path: ApplicationFlowRoute.General,
        data: { title: 'prop.application_to_loan', backConfig: { link: `/loan/details/${ApplicationRoute.Flow}` } },
        loadComponent: () => import('./pages/flow/a-flow-general/a-flow-general').then((c) => c.AFlowGeneral),
      },
      {
        path: ApplicationFlowRoute.Finance,
        data: { title: 'prop.application_to_loan', backConfig: { link: `/application/${ApplicationRoute.Flow}/general` } },
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
