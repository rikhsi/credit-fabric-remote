import { Routes } from '@angular/router';
import { RootRoute } from '@constants';
import { LoanApplicationLayout, LoanLayout } from '@layouts/views';

export const routes: Routes = [
  {
    path: RootRoute.Loan,
    component: LoanLayout,
    loadChildren: () => import('@pages/loan/loan.routes').then((r) => r.routes),
  },
  {
    path: RootRoute.LoanApplication,
    component: LoanApplicationLayout,
    loadChildren: () => import('@pages/loan-application/loan-application.routes').then((r) => r.routes),
  },
  {
    path: '**',
    redirectTo: RootRoute.Loan,
  },
];
