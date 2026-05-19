import { Routes } from '@angular/router';
import { RootRoute, RouteParam } from '@constants';
// import { authGuard, mainGuard } from '@core/guards';
import { AuthLayout, LoanLayout } from '@layouts/views';

export const routes: Routes = [
  {
    path: RootRoute.Auth,
    component: AuthLayout,
    // canActivate: [authGuard],
    loadChildren: () => import('@pages/auth/auth.routes').then((r) => r.routes),
  },
  {
    path: '',
    // canActivate: [mainGuard],
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
        children: [
          {
            path: '',
            loadComponent: () => import('@pages/applications/applications').then((c) => c.Applications),
          },
        ],
      },
      {
        path: `${RootRoute.Document}/:${RouteParam.DocId}`,
        loadComponent: () => import('@pages/document/document').then((c) => c.Document),
      },
      {
        path: 'bridge',
        loadComponent: () => import('@pages/bridge-test/bridge-test').then((c) => c.BridgeTest),
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
    redirectTo: RootRoute.Auth,
  },
];
