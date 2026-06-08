import { Routes } from '@angular/router';
import { NotAuthorizedGuard } from '../../../../core/guards/not-authorized.guard';

export const BANK_ROUTES: Routes = [
  {
    path: 'bank',
    loadComponent: () => import('./bank.component').then((m) => m.BankComponent),
    data: { animation: 'bank' },
    canActivate: [NotAuthorizedGuard],
  },
  {
    path: 'bank/recall',
    loadComponent: () => import('./components/recalls/recalls.component').then(m => m.RecallsComponent),
    data: { animation: 'recall' },
    canActivate: [NotAuthorizedGuard],
  }
]
