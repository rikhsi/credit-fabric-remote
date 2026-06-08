import { PaymentCounteragentComponent } from './components/payment-counteragent/payment-counteragent.component';
import { PaymentTemplateComponent } from './components/payment-template/payment-template.component';
import { PaymentJkuComponent } from './components/payment-jku/payment-jku.component';
import { PaymentBudgetComponent } from './components/payment-budget/payment-budget.component';
import { PaymentSalaryComponent } from './components/payment-salary/payment-salary.component';
import {
  PaymentTransferAccountsComponent
} from './components/payment-transfer-accounts/payment-transfer-accounts.component';
import {
  PaymentTransferTransitComponent
} from './components/payment-transfer-transit/payment-transfer-transit.component';
import {
  PaymentCurrencyOperationsComponent
} from './components/payment-currency-operations/payment-currency-operations.component';
import {
  PaymentCurrencyTransferComponent
} from './components/payment-currency-transfer/payment-currency-transfer.component';
import {
  PaymentTopupBusinessCardsComponent
} from './components/payment-topup-business-cards/payment-topup-business-cards.component';
import { PaymentRequirementComponent } from './components/payment-requirement/payment-requirement.component';
import {
  PaymentCollectionOrderComponent
} from './components/payment-collection-order/payment-collection-order.component';
import { PaymentIssueInvoiceComponent } from './components/payment-issue-invoice/payment-issue-invoice.component';
import { PaymentAutoAcceptanceComponent } from './components/payment-auto-acceptance/payment-auto-acceptance.component';
import {
  PaymentMetalOperationsComponent
} from './components/payment-metal-operations/payment-metal-operations.component';
import { Routes } from '@angular/router';


export const createPaymentRoutes: Routes = [

  {
    path: '',
    redirectTo: 'counteragent',
    pathMatch: 'full',
  },
  {
    path: 'counteragent',
    component: PaymentCounteragentComponent,
    data: {animation: 'counteragent'},
  },
  {
    path: 'template',
    component: PaymentTemplateComponent,
    data: {animation: 'template'},
  },
  {
    path: 'jku',
    component: PaymentJkuComponent,
    data: {animation: 'jku'},
  },
  {
    path: 'budget',
    component: PaymentBudgetComponent,
    data: {animation: 'budget'},
  },
  {
    path: 'salary',
    component: PaymentSalaryComponent,
    data: {animation: 'salary'},
  },
  {
    path: 'transfer-accounts',
    component: PaymentTransferAccountsComponent,
    data: {animation: 'transfer-accounts'},
  },
  {
    path: 'transfer-transit',
    component: PaymentTransferTransitComponent,
    data: {animation: 'transfer-transit'},
  },
  {
    path: 'currency-operations',
    component: PaymentCurrencyOperationsComponent,
    data: {animation: 'currency-operations'},
  },
  {
    path: 'currency-transfer',
    component: PaymentCurrencyTransferComponent,
    data: {animation: 'currency-transfer'},
  },
  {
    path: 'card-topup',
    component: PaymentTopupBusinessCardsComponent,
    data: {animation: 'card-topup'},
  },
  {
    path: 'requirements',
    component: PaymentRequirementComponent,
    data: {animation: 'requirements'},
  },
  {
    path: 'collection-order',
    component: PaymentCollectionOrderComponent,
    data: {animation: 'collection-order'},
  },
  {
    path: 'issue-invoice',
    component: PaymentIssueInvoiceComponent,
    data: {animation: 'issue-invoice'},
  },
  {
    path: 'auto-acceptance',
    component: PaymentAutoAcceptanceComponent,
    data: {animation: 'auto-acceptance'},
  },
  {
    path: 'metal-operations',
    component: PaymentMetalOperationsComponent,
    data: {animation: 'metal-operations'},
  },
];
