import { Routes } from "@angular/router";

export const loansRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./loans.component').then(c => c.LoansComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'my' },
      {
        path: 'my',
        loadComponent: () =>
          import('./pages/loans-my/loans-my.component').then(c => c.LoansMyComponent),
      },
      {
        path: 'closed',
        loadComponent: () =>
          import('./pages/loans-closed/loans-closed.component').then(c => c.LoansClosedComponent),
      }
    ]
  },
  {
    path: 'details',
    loadComponent: () =>
      import('./pages/loan-detail/loan-detail.component').then(c => c.LoanDetailComponent),
  },
  // {
  //   path: ':id/repay',
  //   loadComponent: () =>
  //     import('./create-payment/loan-repay/loan-repay.component').then(c => c.LoanRepayComponent),
  // },
  {
    path: ':id/schedule',
    loadComponent: () =>
      import('./pages/loan-schedule/loan-schedule.component').then(c => c.LoanScheduleComponent),
  },
];
