import { Routes } from '@angular/router';

export const STATEMENT_HISTORY_V2_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./statements-history-v2.component').then(m => m.StatementsHistoryV2Component),
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
      },
      {
        path: 'list',
        loadComponent: () => import('./components/statement-history-chart/statement-history-chart.component')
      },
      {
        path: 'create-statement',
        loadChildren: () =>
          import('./components/create-statement/create-statement.route')
            .then(m => m.CREATE_STATEMENT_ROUTES),
      },
    ],
  },
];
