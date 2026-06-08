import { Routes } from '@angular/router';
import { NotAuthorizedGuard } from '../../../../core/guards/not-authorized.guard';
import { ConversionsComponent } from './components/conversion/conversions.component';
import { PermissionGuard } from '../../../../core/guards/permission.guard';


export const OPERATIONS_ROUTES: Routes = [
  {
    path: 'operations',
    loadComponent: () => import('./operations.component').then((m) => m.OperationsComponent),
    data: {animation: 'operations', permissions: ['CONVERSION', 'SWIFT']},
    canActivate: [NotAuthorizedGuard, PermissionGuard],
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
      },
      {
        path: 'list',
        loadComponent: () => import('./components/operations-list/operations-list.component')
          .then((m) => m.OperationsListComponent),
        data: {animation: 'operations', permissions: ['CONVERSION', 'SWIFT']},
        canActivate: [NotAuthorizedGuard, PermissionGuard],
      },
      {
        path: 'conversions',
        data: { animation: 'conversions' },
        children: [
          {
            path: '',
            component: ConversionsComponent,
            data: { animation: 'conversions', permissions: ['CONVERSION'] },
            canActivate: [PermissionGuard],
          },
          {
            path: 'create',
            loadComponent: () => import('./components/create-conversion/create-conversion.component')
              .then((m) => m.CreateConversionComponent),
            data: {animation: 'create-conversions', permissions: ['CONVERSION']},
            canActivate: [PermissionGuard],
          },
        ]
      },
      {
        path: 'swift',
        data: {animation: 'swift'},
        children: [
          {
            path: '',
            loadComponent: () => import('./components/siwft/swift.component')
              .then(m => m.SwiftComponent),
            data: { animation: 'swift', permissions: ['SWIFT'] },
            canActivate: [PermissionGuard],
          },
          {
            path: 'swift-docs',
            loadComponent: () => import('./components/swift-docs/swift-docs.component')
              .then(m => m.SwiftDocsComponent),
            data: { animation: 'swift-docs', permissions: ['SWIFT'] },
            canActivate: [PermissionGuard],
          }
        ]
      },
      {
        path: 'gpi-tracker',
        loadComponent: () => import('./components/gpi-tracker/gpi-tracker.component')
          .then(m => m.GpiTrackerComponent),
        data: { animation: 'gpi-tracker', permissions: ['SWIFT'] },
        canActivate: [PermissionGuard]
      },
    ]
  },
  {
    path: 'currency-transactions',
    loadComponent: () => import('./views/currency-transactions/currency-transactions.component')
      .then(m => m.CurrencyTransactionsComponent),
    data: { animation: 'currency-transactions', permissions: ['SWIFT'] },
    canActivate: [PermissionGuard],
  },
  {
    path: 'currency-buy',
    loadComponent: () => import('./views/currency-buy/currency-buy.component')
      .then(m => m.CurrencyBuyComponent),
    data: { animation: 'currency-buy', permissions: ['CONVERSION'] },
    canActivate: [PermissionGuard],
  },
  {
    path: 'currency-sell',
    loadComponent: () => import('./views/currency-sell/currency-sell.component')
      .then(m => m.CurrencySellComponent),
    data: { animation: 'currency-sell', permissions: ['CONVERSION'] },
    canActivate: [PermissionGuard],
  },
  {
    path: 'conversion-operations',
    loadComponent: () => import('./views/conversion-operations/conversion-operations.component')
      .then(m => m.ConversionOperationsComponent),
    data: { animation: 'conversion-operations', permissions: ['CONVERSION'] },
    canActivate: [PermissionGuard],
  },
  {
    path: 'create-swift',
    loadComponent: () => import('./views/create-swift/create-swift.component')
      .then(m => m.CreateSwiftComponent),
    data: { animation: 'create-swift', permissions: ['SWIFT'] },
    canActivate: [PermissionGuard],
  },
  {
    path: 'create-currency-buy',
    loadComponent: () => import('./views/create-currency-buy/create-currency-buy.component')
      .then(m => m.CreateCurrencyBuyComponent),
    data: { animation: 'create-currency-buy', permissions: ['CONVERSION'] },
    canActivate: [PermissionGuard],
  },
  {
    path: 'create-currency-sell',
    loadComponent: () => import('./views/create-currency-sell/create-currency-sell.component')
      .then(m => m.CreateCurrencySellComponent),
    data: { animation: 'create-currency-sell', permissions: ['CONVERSION'] },
    canActivate: [PermissionGuard],
  },
  {
    path: 'create-cross-conversion',
    loadComponent: () => import('./views/create-cross-conversion/create-cross-conversion.component')
      .then(m => m.CreateCrossConversionComponent),
    data: { animation: 'create-cross-conversion', permissions: ['CONVERSION'] },
    canActivate: [PermissionGuard],
  },
  {
    path: 'eisvo',
    loadComponent: () => import('./views/eisvo/eisvo.component')
      .then(m => m.EisvoComponent),
    data: { animation: 'eisvo' }
  },
]
