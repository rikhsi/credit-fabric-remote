import { Routes } from '@angular/router';
import { RootRoute } from '@constants';
import { LoanLayout } from '@layouts/views';

export const routes: Routes = [
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
    data: { title: 'Мои заявки' },
    children: [
      {
        path: '',
        loadComponent: () => import('@pages/applications/applications').then((c) => c.Applications),
      },
    ],
  },
  {
    path: '**',
    redirectTo: RootRoute.Loan,
  },
];
