import { Routes } from '@angular/router';
import { RootRoute } from './constants/route-path';
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
        path: RootRoute.OneId,
        component: LoanLayout,
        loadChildren: () => import('@pages/oneid/oneid.routes').then((r) => r.routes),
      },
      {
        path: RootRoute.Applications,
        component: LoanLayout,
        data: { title: 'prop.my_applications' },
        loadChildren: () => import('@pages/applications/applications.routes').then((r) => r.routes),
      },
      {
        path: RootRoute.Documents,
        loadChildren: () => import('@pages/documents/documents.routes').then((r) => r.routes),
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
