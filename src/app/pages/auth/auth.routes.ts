import { Route } from '@angular/router';
import { AuthRoute } from '@app/constants/route-path';

export const routes: Route[] = [
  {
    path: AuthRoute.Login,
    loadComponent: () => import('./pages/auth-login/auth-login').then((c) => c.AuthLogin),
  },
  {
    path: AuthRoute.OneId,
    loadComponent: () => import('./pages/auth-one-id/auth-one-id').then((c) => c.AuthOneId),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: AuthRoute.Login,
  },
];
