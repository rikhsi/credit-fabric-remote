import { Routes } from "@angular/router";
// import { StatementTypeRouteUrl } from "src/app/constants";

export const CREATE_STATEMENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./create-statement.component'),
    children: [
      {
        path: '',
        loadComponent: () => import('./components/create-new-statement.component')
      },
      // {
      //   path: '',
      //   redirectTo: '/charts/create-statement/account',
      //   pathMatch: 'full'
      // },
      // {
      //   path: StatementTypeRouteUrl.ACCOUNT_STATEMENT,
      //   loadComponent: () => import('./components/account-statement/account-statement.component')
      // },
      // {
      //   path: StatementTypeRouteUrl.KARTOTEK_STATEMENT,
      //   loadComponent: () => import('./components/kartotek-statement/kartotek-statement.component')
      // },
      // {
      //   path: StatementTypeRouteUrl.ACCOUNT_INFO,
      //   loadComponent: () => import('./components/account-info/account-info.component')
      // },
      // {
      //   path: StatementTypeRouteUrl.PERSONAL_ACCOUNT_STATEMENT,
      //   loadComponent: () => import('./components/personal-account-statement/personal-account-statement.component')
      // },
      // {
      //   path: StatementTypeRouteUrl.TURNOVER_STATEMENT,
      //   loadComponent: () => import('./components/turnover-statement/turnover-statement.component')
      // },
      // {
      //   path: StatementTypeRouteUrl.PAYMENT_DOCUMENTS,
      //   loadComponent: () => import('./components/payment-documents/payment-documents.component')
      // },
      // {
      //   path: StatementTypeRouteUrl.REGISTERS,
      //   loadComponent: () => import('./components/registers/registers.component')
      // },
      // {
      //   path: StatementTypeRouteUrl.CURRENCY_RATES,
      //   loadComponent: () => import('./components/currency-rates/currency-rates.component')
      // }
    ]
  },

]
