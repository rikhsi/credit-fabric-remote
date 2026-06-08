import { Routes } from "@angular/router";

export const loanRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./loan.component').then(c => c.LoanComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'main' },
      {
        path: 'main',
        loadComponent: () =>
        import('./pages/loan-main/loan-main.component').then(c => c.LoanMainComponent),
        children:[
          { path: '', pathMatch: 'full', redirectTo: 'my' },
          {
              path: 'my',
              loadComponent: () =>
                import('./pages/loan-my/loan-my.component').then(c => c.LoanMyComponent),
            },
            {
              path: 'closed',
              loadComponent: () =>
                import('./pages/loan-closed/loan-closed.component').then(c => c.LoanClosedComponent),
            },

        ]
      },
      
      {
        path: 'details/:id',
        loadComponent: () =>
          import('./pages/loan-detail/loan-detail.component').then(c => c.LoanDetailComponent),
      },
        {
        path: 'payment-schedule/:id',
        loadComponent: () =>
          import('./pages/payment-schedule/payment-schedule.component').then(c => c.PaymentScheduleComponent),
      },
      {
        path: 'pay-off-the-loan/:id',
        loadComponent: () =>
          import('./pages/pay-off-the-loan/pay-off-the-loan.component').then(c => c.PayOffTheLoanComponent),
      }
    ]
  },
];
