import { Routes } from '@angular/router';
import { RootRoute } from './constants/route-path';
import { RouteParam } from './constants/route-param';
import { LoanLayout } from '@layouts/views';

export const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: RootRoute.Loan,
        component: LoanLayout,
        loadChildren: () => import('@pages/loan/loan.routes').then((r) => r.routes),
      },
      {
        path: RootRoute.Application,
        component: LoanLayout,
        loadChildren: () => import('@pages/application/application.routes').then((r) => r.routes),
      },
      {
        path: RootRoute.Applications,
        component: LoanLayout,
        data: { title: 'prop.my_applications' },
        loadChildren: () => import('@pages/applications/applications.routes').then((r) => r.routes),
      },
      {
        path: `${RootRoute.Document}/:${RouteParam.DocId}`,
        loadComponent: () => import('@pages/document/document').then((c) => c.Document),
      },
      {
        path: '**',
        redirectTo: RootRoute.Loan,
      },
    ],
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: RootRoute.Loan,
  },
];
