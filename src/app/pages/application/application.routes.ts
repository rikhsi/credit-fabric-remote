import { Routes } from '@angular/router';
import { LoanApplicationRoute } from '@constants';

export const routes: Routes = [
  {
    path: LoanApplicationRoute.General,
    data: { title: 'Заявка на кредит', backConfig: { link: '/loan/details/2' } },
    loadComponent: () => import('./pages/a-general/a-general').then((c) => c.AGeneral),
  },
  {
    path: LoanApplicationRoute.Finance,
    data: { title: 'Заявка на кредит', backConfig: { link: '/application/general' } },
    loadComponent: () => import('./pages/a-finance/a-finance').then((c) => c.AFinance),
  },
  {
    path: '**',
    redirectTo: LoanApplicationRoute.General,
  },
];
