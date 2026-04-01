import { Routes } from '@angular/router';
import { LoanApplicationRoute } from '@constants';

export const routes: Routes = [
  {
    path: LoanApplicationRoute.General,
    data: { title: 'pages.loan-application.general.title' },
    loadComponent: () => import('./pages/l-a-general/l-a-general').then((c) => c.LAGeneral),
  },
  {
    path: LoanApplicationRoute.Finance,
    data: { title: 'pages.loan-application.finance.title' },
    loadComponent: () => import('./pages/l-a-finance/l-a-finance').then((c) => c.LAFinance),
  },
];
