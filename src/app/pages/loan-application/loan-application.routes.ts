import { Routes } from '@angular/router';
import { LoanApplicationRoute } from '@constants';

export const routes: Routes = [
  {
    path: LoanApplicationRoute.General,
    data: { title: 'Заявка на кредит', backConfig: { link: '/loan/details/2' } },
    loadComponent: () => import('./pages/l-a-general/l-a-general').then((c) => c.LAGeneral),
  },
  {
    path: LoanApplicationRoute.Finance,
    data: { title: 'Заявка на кредит', backConfig: { link: '/loan-application/general' } },
    loadComponent: () => import('./pages/l-a-finance/l-a-finance').then((c) => c.LAFinance),
  },
  {
    path: '**',
    redirectTo: LoanApplicationRoute.General,
  },
];
