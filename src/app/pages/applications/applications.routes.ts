import { Routes } from '@angular/router';
import { RootRoute } from '@app/constants/route-path';
import { RouteParam } from '@app/constants/route-param';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/applications-list/applications-list').then((c) => c.ApplicationsList),
  },
  {
    path: `:${RouteParam.AppId}`,
    data: {
      title: 'Заявка №1',
      backConfig: { link: ['/', RootRoute.Applications] },
    },
    loadComponent: () => import('./pages/applications-detail/applications-detail').then((c) => c.ApplicationsDetail),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
