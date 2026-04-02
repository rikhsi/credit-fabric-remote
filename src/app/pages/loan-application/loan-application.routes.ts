import { Routes } from '@angular/router';
import { LoanApplicationRoute } from '@constants';

export const routes: Routes = [
  {
    path: LoanApplicationRoute.General,
    data: { title: 'Общая информация по клиенту' },
    loadComponent: () => import('./pages/l-a-general/l-a-general').then((c) => c.LAGeneral),
  },
  {
    path: LoanApplicationRoute.Finance,
    data: { title: 'Финансовые данные' },
    loadComponent: () => import('./pages/l-a-finance/l-a-finance').then((c) => c.LAFinance),
  },
  {
    path: '**',
    redirectTo: LoanApplicationRoute.General,
  },
];
