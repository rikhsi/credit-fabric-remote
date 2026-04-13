import { Routes } from '@angular/router';
import { ApplicationRoute, ApplicationFlowRoute } from '@constants';

export const routes: Routes = [
  {
    path: ApplicationRoute.Flow,
    children: [
      {
        path: ApplicationFlowRoute.General,
        data: { title: 'prop.application_to_loan', backConfig: { link: '/loan/details/2' } },
        loadComponent: () => import('./pages/a-general/a-general').then((c) => c.AGeneral),
      },
      {
        path: ApplicationFlowRoute.Finance,
        data: { title: 'prop.application_to_loan', backConfig: { link: '/application/flow/general' } },
        loadComponent: () => import('./pages/a-finance/a-finance').then((c) => c.AFinance),
      },
      {
        path: '**',
        redirectTo: ApplicationFlowRoute.General,
      },
    ],
  },
  {
    path: '**',
    redirectTo: ApplicationRoute.Flow,
  },
];
