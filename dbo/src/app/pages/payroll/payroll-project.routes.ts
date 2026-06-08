import { Routes } from '@angular/router';
import { STATEMENT_MODE } from '../../features/payroll/statement-form/statement-form.model';

export const payrollProjectRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'statements' },
  {
    path: 'statements/create',
    loadComponent: () => import('./statement-form-page/statement-form-page.component')
      .then((c) => c.StatementFormPageComponent),
    data: { mode: STATEMENT_MODE.CREATE }
  },
  {
    path: 'statements/:transactionId',
    loadComponent: () =>
      import('../../views/main/features/payroll-project/components/payroll-statement-detail/payroll-statement-detail.component')
        .then(c => c.PayrollStatementDetailComponent),
  },
  {
    path: 'statements/:transactionId/edit',
    loadComponent: () => import('./statement-form-page/statement-form-page.component')
      .then((c) => c.StatementFormPageComponent),
    data: { mode: STATEMENT_MODE.EDIT }
  },
  {
    path: 'statements/:transactionId/repeat',
    loadComponent: () => import('./statement-form-page/statement-form-page.component')
      .then((c) => c.StatementFormPageComponent),
    data: { mode: STATEMENT_MODE.REPEAT }
  },
  {
    path: 'statements',
    loadComponent: () => import('./statements-page/statements-page.component')
      .then((c) => c.StatementsPageComponent),
  },
  {
    path: 'employees',
    loadComponent: () => import('../payroll/statement-employees-page/statement-employees-page.component')
      .then((m) => m.StatementEmployeesPageComponent),
  },
];
