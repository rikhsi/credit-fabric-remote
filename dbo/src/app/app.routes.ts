import { Routes } from '@angular/router';

import { AuthorizedGuard } from './core/guards/authorized.guard';
import { canActivateGuard, canViewForCodeGuard, NotAuthorizedGuard } from './core/guards/not-authorized.guard';
import {
  ChatConversationComponent,
} from './views/main/features/chat/components/chat-conversation/chat-conversation.component';
import { ChatFaqComponent } from './views/main/features/chat/components/chat-faq/chat-faq.component';
import {
  MyOfficeMainComponent,
} from './views/main/features/my-office/office/components/my-office-main/my-office-main.component';
import {
  MyOfficePaymentComponent,
} from './views/main/features/my-office/office/components/my-office-payment/my-office-payment.component';
import { MeComponent } from "./views/main/features/profile/components/me/me.component";
import {
  NotificationListComponent
} from "./views/main/features/notifications/components/notification-list/notification-list.component";
// import { AttachUserComponent } from "./views/main/features/settings/components/attach-user/attach-user.component";
// import { SignOrderComponent } from "./views/main/features/settings/components/sign-order/sign-order.component";
import { OPERATIONS_ROUTES } from './views/main/features/operations/operations.routes';
import { BANK_ROUTES } from './views/main/features/bank/bank.routes';
// import { AddPaymentComponent } from "./views/main/features/add-payment/add-payment.component";
import { createPaymentRoutes } from './views/main/features/create-payment/create-payment.routes';
import { PermissionGuard } from './core/guards/permission.guard';
// import {
//   TransferToAccountComponent
// } from "./views/main/features/add-payment/components/transfer-to-account/transfer-to-account.component";
// import {
//   TransferToBudgetComponent ю?
// } from "./views/main/features/add-payment/components/transfer-to-budget/transfer-to-budget.component";
// import {CheckTransactionComponent} from "./views/check-transaction/check-transaction-component";
// import {AccountComponent} from "./views/main/features/new-accounts/components/account/account.component";
import { MyProfileComponent } from "./views/main/features/new-settings/components/my-profile/my-profile.component";
import {
  MyNotificationsComponent
} from "./views/main/features/new-settings/components/notifications/notifications.component";
import { OrganizationComponent } from "./views/main/features/new-settings/components/organization/organization.component";
import { ESignatureComponent } from "./views/main/features/new-settings/components/e-signature/e-signature.component";
import { SecurityComponent } from "./views/main/features/new-settings/components/security/security.component";
import { UsersComponent } from "./views/main/features/new-settings/components/users/users.component";
import { RoutersComponent } from "./views/main/features/new-settings/components/routers/routers.component";
import { BankInfoComponent } from "./views/main/features/new-settings/bank-info/bank-info.component";
import {
  TransferToMunisServicesComponent
} from "./views/main/features/add-payment/components/transfer-to-munis/transfer-to-munis-services/transfer-to-munis-services.component";
import {
  CreateMyOfficeChooseServiceComponent
} from "./views/main/features/add-payment/components/transfer-to-munis/my-office/component/services/services-choose.component";
import { DepositDetailsComponent } from './views/main/features/deposits/components/deposit-details/deposit-details.component';
import { DepositMainComponent } from './views/main/features/deposits/components/deposit-main/deposit-main.component';
import { DepositTransferComponent } from './views/main/features/deposits/components/deposit-transfer/deposit-transfer.component';

export const APP_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'main',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadComponent: () => import('./views/auth/auth.component').then((m) => m.AuthComponent),
    data: { animation: 'auth' },
    canActivate: [AuthorizedGuard]
  },
  {
    path: 'new-auth',
    loadComponent: () => import('./views/auth/new-auth/new-auth.component').then((m) => m.NewAuthComponent),
    data: { animation: 'auth' },
    canActivate: [AuthorizedGuard],
  },
  {
    path: 'auth/sms-check',
    loadComponent: () => import('./views/auth/components/sms/new-auth-sms.component')
      .then((m) => m.NewAuthSmsComponent),
    data: { animation: 'sms-check' },
    canActivate: [AuthorizedGuard]
  },
  {
    path: 'auth/mail-check',
    loadComponent: () => import('./views/auth/components/mail/new-auth-mail.component')
      .then((m) => m.NewAuthMailComponent),
    data: { animation: 'mail-check' },
    canActivate: [AuthorizedGuard]
  },
  {
    path: 'auth/my-id',
    loadComponent: () => import('./views/auth/components/myId/new-auth-myId.component')
      .then((m) => m.NewAuthMyIdComponent),
    data: { animation: 'mail-check' },
  },
  {
    path: 'auth/branches',
    loadComponent: () => import('./views/auth/components/branches/new-auth-branches.component')
      .then((m) => m.NewAuthBranchesComponent),
    data: { animation: 'branches-check' },
    canActivate: [AuthorizedGuard]
  },
  {
    path: 'auth/mob-esp',
    loadComponent: () => import('./views/auth/components/esp/new-auth-esp.component')
      .then((m) => m.NewAuthEspComponent),
    data: { animation: 'esp-check' },
    canActivate: [AuthorizedGuard]
  },
  {
    path: 'auth/phys-esp',
    loadComponent: () => import('./views/auth/components/phys-esp/new-auth-phys-esp.component')
      .then((m) => m.NewAuthPhysEspComponent),
    data: { animation: 'esp-check' },
    canActivate: [AuthorizedGuard]
  },
  {
    path: 'auth/qr-sign',
    loadComponent: () => import('./views/auth/components/qr-sign/qr-sign.component')
      .then((m) => m.QrSignComponent),
    data: { animation: 'qr-sign' },
    canActivate: [AuthorizedGuard]
  },
  {
    path: 'auth/forget-password',
    loadComponent: () => import('./views/auth/components/forget-password/new-auth-forget-password.component')
      .then((m) => m.NewAuthForgetPasswordComponent),
    data: { animation: 'forget-password' },
    canActivate: [AuthorizedGuard]
  },
  {
    path: 'auth/instructions',
    loadComponent: () => import('./views/auth/components/instuctions/new-auth-instructions.component')
      .then((m) => m.NewAuthInstructionsComponent),
    data: { animation: 'instructions' },
    canActivate: [AuthorizedGuard]
  },
  {
    path: 'check-transaction',
    loadComponent: () => import('./views/check-transaction/check-transaction-component').then((m) => m.CheckTransactionComponent),
    data: { animation: 'check-transaction' },
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./views/main/features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    data: { animation: 'dashboard' },
    canActivate: [NotAuthorizedGuard]
  },
  // {
  //   path: 'main',
  //   loadComponent: () => import('./views/main/features/main/main.component').then((m) => m.MainComponent),
  //   data: {animation: 'main'},
  //   canActivate: [NotAuthorizedGuard]
  // },
  {
    path: 'main',
    loadComponent: () => import('./views/main/features/new-main/new-main.component').then((m) => m.NewMainComponent),
    data: { animation: 'main' },
    canActivate: [NotAuthorizedGuard]
  },
  {
    path: 'locations',
    loadComponent: () => import('./views/main/features/loactions/loactions.component').then((m) => m.LoactionsComponent),
    data: { animation: 'locations' },
    canActivate: [NotAuthorizedGuard]
  },
  {
    path: 'new-locations',
    loadComponent: () => import('./views/main/features/new-settings/new-loactions/new-loactions.component').then((m) => m.NewLoactionsComponent),
    data: { animation: 'locations' },
    canActivate: [NotAuthorizedGuard]
  },
  {
    path: 'payment',
    loadComponent: () => import('./views/main/features/add-payment/add-payment.component').then((m) => m.AddPaymentComponent),
    data: { animation: 'payment' },
    canActivate: [NotAuthorizedGuard],
  },
  {
    path: 'accounts',
    loadComponent: () => import('./views/main/features/new-accounts/new-accounts.component').then((m) => m.NewAccountsComponent),
    data: { animation: 'accounts' },
    canActivate: [NotAuthorizedGuard, canActivateGuard('ACCOUNTS')],
  },
  {
    path: 'accounts/account/:id',
    loadComponent: () => import('./views/main/features/new-accounts/components/account/account.component').then((m) => m.AccountComponent),
    data: { animation: 'account/:id' },
    canActivate: [NotAuthorizedGuard, canActivateGuard('ACCOUNTS')],
  },
  {
    path: 'account-history/:account',
    loadComponent: () => import('./views/main/features/new-accounts/components/account-history/account-history.component').then((m) => m.AccountHistoryComponent),
    data: { animation: 'account-history' },
    canActivate: [NotAuthorizedGuard, canActivateGuard('ACCOUNTS')],
  },
  {
    path: 'payment/transfer-to-account',
    loadComponent: () => import('./views/main/features/add-payment/components/transfer-to-account/transfer-to-account.component')
      .then((m) => m.TransferToAccountComponent),
    data: { animation: 'transfer-to-account' },
    canActivate: [NotAuthorizedGuard]
  },
  {
    path: 'payment/transfer-to-budget',
    loadComponent: () => import('./views/main/features/add-payment/components/transfer-to-budget/transfer-to-budget.component')
      .then((m) => m.TransferToBudgetComponent),
    data: { animation: 'transfer-to-budget' },
    canActivate: [NotAuthorizedGuard]
  },
  {
    path: 'payment/transfer-to-card',
    loadComponent: () => import('./views/main/features/add-payment/components/transfer-to-card/transfer-to-card.component')
      .then((m) => m.TransferToCardComponent),
    data: { animation: 'transfer-to-card' },
    canActivate: [NotAuthorizedGuard]
  },
  {
    path: 'payment/transfer-to-corporate-card',
    loadComponent: () => import('./views/main/features/add-payment/components/transfer-to-corporate-card/transfer-to-corporate-card.component')
      .then((m) => m.TransferToCorporateCardComponent),
    data: { animation: 'transfer-to-corporate-card' },
    canActivate: [NotAuthorizedGuard]
  },
  {
    path: 'payment/transfer-to-treasure',
    loadComponent: () => import('./views/main/features/add-payment/components/transfer-to-treasure/transfer-to-treasure.component')
      .then((m) => m.TransferToTreasureComponent),
    data: { animation: 'transfer-to-treasure' },
    canActivate: [NotAuthorizedGuard]
  },
  {
    path: 'payment/transfer-to-munis',
    loadComponent: () => import('./views/main/features/add-payment/components/transfer-to-munis/transfer-to-munis.component')
      .then((m) => m.TransferToMunisComponent),
    data: { animation: 'transfer-to-munis' },
    canActivate: [NotAuthorizedGuard],
  },
  {
    path: 'payment/transfer-to-munis/services',
    loadComponent: () => import('./views/main/features/add-payment/components/transfer-to-munis/transfer-to-munis-services/transfer-to-munis-services.component')
      .then((m) => m.TransferToMunisServicesComponent),
    data: { animation: 'transfer-to-munis-services' },
    canActivate: [NotAuthorizedGuard],
  },
  {
    path: 'payment/transfer-to-munis/create-transaction',
    loadComponent: () => import('./views/main/features/add-payment/components/transfer-to-munis/transfer-to-munis-create-transaction/transfer-to-munis-create-transaction.component')
      .then((m) => m.TransferToMunisCreateTransactionComponent),
    data: { animation: 'transfer-to-munis-create-transaction' },
    canActivate: [NotAuthorizedGuard],
  },
  {
    path: 'payment/transfer-to-munis/my-office',
    loadComponent: () => import('./views/main/features/add-payment/components/transfer-to-munis/my-office/my-office.component')
      .then((m) => m.MyOfficeComponent),
    data: { animation: 'transfer-to-munis-create-transaction' },
    canActivate: [NotAuthorizedGuard],
  },
  {
    path: 'payment/transfer-to-munis/create-my-office',
    loadComponent: () => import('./views/main/features/add-payment/components/transfer-to-munis/my-office/component/services/services-choose.component')
      .then((m) => m.CreateMyOfficeChooseServiceComponent),
    data: { animation: 'transfer-to-munis-create-my-office-transaction' },
    canActivate: [NotAuthorizedGuard],
  },
  {
    path: 'payment/transfer-to-munis/create-my-office/services',
    loadComponent: () => import('./views/main/features/add-payment/components/transfer-to-munis/my-office/component/child-services/child-services-choose.component')
      .then((m) => m.CreateMyOfficeChooseChildServiceComponent),
    data: { animation: 'transfer-to-munis-child-create-my-office-transaction' },
    canActivate: [NotAuthorizedGuard],
  },
  {
    path: 'payment/mass-payments',
    loadComponent: () => import('./views/main/features/mass-payments/mass-payments.component'),
    data: { animation: 'mass-payments' },
    canActivate: [NotAuthorizedGuard]
  },
  {
    path: 'payment/mass-payments/created-payments/:id',
    loadComponent: () => import('./views/main/features/mass-payments/components/created-payments/created-payments.component'),
    data: { animation: 'mass-payments-created-payments' },
    canActivate: [NotAuthorizedGuard]
  },
  {
    path: 'new-payment',
    loadComponent: () => import('./views/main/features/new-payment/new-payment.component').then((m) => m.NewPaymentComponent),
    canActivate: [NotAuthorizedGuard],
    data: { animation: 'new-payment' }
  },
  {
    path: 'conversion',
    loadComponent: () => import('./views/main/features/conversion/conversion.component').then((m) => m.ConversionComponent),
    canActivate: [NotAuthorizedGuard],
    data: { animation: 'conversion' }
  },
  {
    path: 'conversion/create-payment',
    loadComponent: () => import('./views/main/features/conversion/components/create-payment/create-payment.component').then((m) => m.CreatePaymentComponent),
    canActivate: [NotAuthorizedGuard],
    data: { animation: 'conversion' }
  },
  {
    path: 'pay/:type',
    loadComponent: () => import('./views/main/features/new-payment/components/pay/pay.component').then((m) => m.PayComponent),
    canActivate: [NotAuthorizedGuard],
    data: { animation: 'pay' },
  },
  {
    path: 'history',
    loadComponent: () => import('./views/main/features/main/components/payments/history/history.component').then((m) => m.HistoryComponent),
    canActivate: [NotAuthorizedGuard],
    data: { animation: 'pay' },
  },
  {
    path: 'pay',
    redirectTo: 'pay/TRANSACTION',
    pathMatch: 'full',
    data: { permissions: ['PAYMENT'] },
  },
  {
    path: 'create-payment',
    loadComponent: () => import('./views/main/features/create-payment/create-payment.component').then((m) => m.CreatePaymentComponent),
    data: { animation: 'create-payment' },
    canActivate: [NotAuthorizedGuard],
    children: createPaymentRoutes,
  },
  {
    path: 'payroll-project',
    canMatch: [NotAuthorizedGuard, canActivateGuard('SALARY')],
    loadChildren: () =>
      import('./pages/payroll/payroll-project.routes').then(c => c.payrollProjectRoutes),
  },
  {
    path: 'corp-card-project/roster/cards/:doc/:parentId',
    loadComponent: () => import('./views/main/features/corp-cards/components-2/corp-roster/corp-roster-cards/corp-roster-cards.component')
      .then((m) => m.CorpRosterCardsComponent),
    data: { animation: 'corp-roster-cards', permissions: ['CORPCARD'] },
    canActivate: [PermissionGuard, canActivateGuard('CARDS')],
  },
  {
    path: 'corp-card-project/corp-cards/roster/upload/:transitAccount/:contractNumber/:type',
    loadComponent: () => import('./views/main/features/corp-cards/components-2/corp-cards/upload-corp-roster/upload-corp-roster.component')
      .then((m) => m.UploadCorpRosterComponent),
    data: { animation: 'corp-card-roster-upload' },
    canActivate: [NotAuthorizedGuard, canActivateGuard('CARDS')],
  },

  {
    path: 'corp-card-project/corp-cards/roster/create/:transitAccount/:contractNumber/:type',
    loadComponent: () => import('./views/main/features/corp-cards/components-2/corp-cards/create-corp-roster/create-corp-roster.component')
      .then((m) => m.CreateCorpRosterComponent),
    data: { animation: 'corp-card-roster-create' },
    canActivate: [NotAuthorizedGuard, canActivateGuard('CARDS')],
  },
  {
    path: 'corp-card-project/corp-cards/roster/top-up/:transitAccount/:contractNumber/:uuid/:type',
    loadComponent: () => import('./views/main/features/corp-cards/components-2/corp-cards/top-up-corp-card/top-up-corp-card.component')
      .then((m) => m.TopUpCorpCardComponent),
    data: { animation: 'corp-card-roster-top-up' },
    canActivate: [NotAuthorizedGuard, canActivateGuard('CARDS')],
  },
  {
    path: 'corp-card-project/corp-cards/items/create',
    loadComponent: () => import('./views/main/features/corp-cards/components-2/corp-cards/corp-card-create/corp-card-create.component')
      .then((m) => m.CorpCardCreateComponent),
    canActivate: [PermissionGuard, canActivateGuard('CARDS')],
    data: { animation: 'corp-cards-create', permissions: ['CORPCARD'] },
  },

  {
    path: 'corp-card-project/corp-cards/items/:transitAccount/:contractNumber/:type',
    loadComponent: () => import('./views/main/features/corp-cards/components-2/corp-cards/card-items/card-items.component')
      .then((m) => m.CardItemsComponent),
    data: { animation: 'corp-card-items' },
    canActivate: [NotAuthorizedGuard, canActivateGuard('CARDS')],
  },
  {
    path: 'corp-card-advertisement',
    loadComponent: () => import('./views/main/features/corp-cards/components/corp-card-advertisement/corp-card-advertisement.component')
      .then((m) => m.CorpCardAdvertisementComponent),
    data: { animation: 'corp-card-advertisement' },
    canActivate: [NotAuthorizedGuard, canActivateGuard('CARDS')],
  },
  {
    path: 'corp-card-project/corp-card-details/:id',
    loadComponent: () => import('./views/main/features/corp-card-project/component/corporative-card/details/details')
      .then((m) => m.DetailComponent),
    data: { animation: 'corp-cards' },
  },
  {
    path: 'corp-card-project',
    loadComponent: () => import('./views/main/features/corp-card-project/corporative-card')
      .then((m) => m.CorporativeCardComponent),
    data: { animation: 'corp-card-project' },
    canActivate: [NotAuthorizedGuard, canActivateGuard('CARDS')],
    children: [
      {
        path: '',
        redirectTo: 'corp-cards',
        pathMatch: 'full',
      },
      {
        path: 'corp-cards',
        loadComponent: () => import('./views/main/features/corp-cards/components-2/corp-cards/corp-cards.component')
          .then((m) => m.CorpCardsComponent),
        data: { animation: 'corp-cards' },
      },
      {
        path: 'corp-roster',
        loadComponent: () => import('./views/main/features/corp-cards/components-2/corp-roster/corp-roster.component')
          .then((m) => m.CorpRosterComponent),
        data: { animation: 'corp-roster' },
      },
      {
        path: 'corp-pending-cards',
        loadComponent: () => import('./views/main/features/corp-cards/components-2/pending-corp-cards/pending-corp-cards.component')
          .then((m) => m.PendingCorpCardsComponent),
        data: { animation: 'corp-pending-cards' },
      },
    ]
  },
  {
    path: 'loans/available-loans/:id',
    loadComponent: () => import('./views/main/features/loans/components/available-loans/available-loan-detail/available-loan-detail.component').then((m) => m.AvailableLoanDetailComponent),
    data: { animation: 'available-loans/:id', permissions: ['CREDIT'] },
    canActivate: [PermissionGuard, canActivateGuard('CREDITS')],
  },
  {
    path: 'loans/create-loan/:id',
    loadComponent: () => import('./views/main/features/loans/components/create-loan/create-loan.component').then((m) => m.CreateLoanComponent),
    data: { animation: 'create-loans', permissions: ['CREDIT'] },
    canActivate: [PermissionGuard, canActivateGuard('CREDITS')],
  },
  {
    path: 'loans/loans-my/pay/:loanId',
    loadComponent: () => import('./views/main/features/loans/components/loan-pay/loan-pay.component').then((m) => m.LoanPayComponent),
    data: { animation: 'loan-pay/:loanId', permissions: ['CREDIT'] },
    canActivate: [PermissionGuard, canActivateGuard('CREDITS')],
  },
  {
    path: 'loans/loans-my/history',
    loadComponent: () => import('./views/main/features/loans/components/my-loan-history/my-loan-history.component').then((m) => m.MyLoanHistoryComponent),
    data: { animation: 'loan-history', permissions: ['CREDIT'] },
    canActivate: [PermissionGuard, canActivateGuard('CREDITS')],
  },
  {
    path: 'guarantees',
    loadComponent: () => import('./views/main/features/guarantees/guarantees.component').then((m) => m.GuaranteesComponent),
    data: { animation: 'guarantees' },
  },
  {
    path: 'loans/loans-my/repayment-schedule/:id',
    loadComponent: () => import('./views/main/features/loans/components/repayment-schedule/repayment-schedule.component').then((m) => m.RepaymentScheduleComponent),
    data: { animation: 'loan-repay-schedule/:id', permissions: ['CREDIT'] },
    canActivate: [PermissionGuard, canActivateGuard('CREDITS')],
  },
  {
    path: 'loans',
    canMatch: [NotAuthorizedGuard, canActivateGuard('CREDITS')],
    loadChildren: () =>
      import('./views/main/features/loans/loans.routes').then(c => c.loansRoutes),
  },
  {
    path:'loan',
    loadChildren:() => import('./views/main/features/loan/loan.routes').then(c => c.loanRoutes)
  },
  {
    path: 'deposits/available-deposits/:id/:name',
    loadComponent: () => import('./views/main/features/deposits/components/available-deposits/available-deposit-detail/available-deposit-detail.component').then((m) => m.AvailableDepositDetailComponent),
    data: { animation: 'available-deposit/:id', permissions: ['DEPOSIT'] },
    canActivate: [PermissionGuard, canActivateGuard('DEPOSITS')],
  },
  {
    path: 'deposits/available-deposits/application/:id/:name',
    loadComponent: () => import('./views/main/features/deposits/components/available-deposits/apply-deposit/apply-deposit.component').then((m) => m.ApplyDepositComponent),
    data: { animation: 'available-deposit-application', permissions: ['DEPOSIT'] },
    canActivate: [PermissionGuard, canActivateGuard('DEPOSITS')],
  },
  {
    path: 'deposits/my-deposits/history',
    loadComponent: () => import('./views/main/features/deposits/components/my-deposit-history/my-deposit-history.component').then((m) => m.MyDepositHistoryComponent),
    data: { animation: 'deposit-history', permissions: ['DEPOSIT'] },
    canActivate: [PermissionGuard, canActivateGuard('DEPOSITS')],
  },
  {
    path: 'deposits/my-deposits/top-up/:id/:attachedAccount',
    loadComponent: () => import('./views/main/features/deposits/components/deposit-top-up/deposit-top-up.component').then((m) => m.DepositTopUpComponent),
    data: { animation: 'deposit-top-up', permissions: ['DEPOSIT'] },
    canActivate: [PermissionGuard, canActivateGuard('DEPOSITS')],
  },
  {
    path: 'deposits/my-deposits/withdraw/:id/:attachedAccount',
    loadComponent: () => import('./views/main/features/deposits/components/withdraw/withdraw.component').then((m) => m.WithdrawComponent),
    data: { animation: 'with-draw', permissions: ['DEPOSIT'] },
    canActivate: [PermissionGuard, canActivateGuard('DEPOSITS')],
  },
  {
    path: 'deposits',
    loadComponent: () => import('./views/main/features/deposits/deposits.component').then((m) => m.DepositsComponent),
    data: { animation: 'deposits' },
    canActivate: [NotAuthorizedGuard, canActivateGuard('DEPOSITS')],
    children: [
      {
        path: '',
        redirectTo: 'my-deposits',
        pathMatch: 'full'
      },
      {
          path: 'my-deposits',
          component: DepositMainComponent,
          data: { animation: 'my-deposits' }
      },
      {
        path: 'details/:id',
        component: DepositDetailsComponent,
        data: { animation: 'details' }
      },
        {
        path: 'transfer/:id',
        component: DepositTransferComponent,
        data: { animation: 'deposit-transfer' }
      },


      // {
      //   path: 'available-deposits',
      //   component: AvailableDepositsComponent,
      //   data: { animation: 'available-deposits' }
      // },
      // {
      //   path: 'my-deposits',
      //   component: MyDepositsComponent,
      //   data: { animation: 'my-deposits' }
      // },

      // {
      //   path: 'applications',
      //   component: DepositApplicationsComponent,
      //   data: { animation: 'deposit-applications' }
      // },
    ]
  },
  {
    path: 'account-payment',
    loadComponent: () => import('./views/main/features/accounts-payments/accounts-payments.component').then((m) => m.AccountsPaymentsComponent),
    data: { animation: 'account-payment' },
    canActivate: [NotAuthorizedGuard],
    children: []
  },
  {
    path: 'accounts-and-payments',
    loadComponent: () => import('./views/main/features/accounts-and-payments/accounts-and-payments.component').then((m) => m.AccountsAndPaymentsComponent),
    data: { animation: 'accounts-and-payments' },
    canActivate: [NotAuthorizedGuard],
    children: []
  },
  {
    path: 'account-history/:id',
    loadComponent: () => import('./views/main/features/accounts-payments/components/statements-history/statements-history.component')
      .then((m) => m.StatementsHistoryComponent),
    data: { animation: 'account-history' }
  },
  {
    path: 'account-payment/create',
    loadComponent: () => import('./views/main/features/accounts-payments/components/create-account/create-account.component').then((m) => m.CreateAccountComponent),
    data: { animation: 'account-payment/create' },
    canActivate: [NotAuthorizedGuard],
    children: []
  },
  {
    path: 'applications',
    loadComponent: () => import('./views/main/features/applications/applications.component').then(m => m.ApplicationsComponent),
    data: { animation: 'applications', permissions: ['APPLICATION'] },
    canActivate: [PermissionGuard]
  },
  ...BANK_ROUTES,

  {
    path: 'kartoteka-1',
    loadComponent: () => import('./views/main/features/kartoteka/kartoteka-1/kartoteka-1.component').then((m) => m.Kartoteka1Component),
    data: { animation: 'kartoteka-1' },
    canActivate: [NotAuthorizedGuard, canActivateGuard('KARTOTEKA')],
    children: []
  },
  {
    path: 'EPT',
    loadComponent: () => import('./views/main/features/kartoteka/ept/ept.component').then((m) => m.EptComponent),
    data: { animation: 'EPT' },
    canActivate: [NotAuthorizedGuard, canActivateGuard('KARTOTEKA')],
    children: []
  },
  // {
  //   path: 'EPT/payment',
  //   loadComponent: () => import('./views/main/features/kartoteka/ept/components/ept-payment/ept-payment.component').then((m) => m.EptPaymentComponent),
  //   data: { animation: 'EPT-payment' },
  //   canActivate: [NotAuthorizedGuard, canActivateGuard('KARTOTEKA')],
  // },

  {
    path: 'kartoteka-2',
    loadComponent: () => import('./views/main/features/kartoteka/kartoteka-2/kartoteka-2.component').then((m) => m.Kartoteka2Component),
    data: { animation: 'kartoteka-2' },
    canActivate: [NotAuthorizedGuard, canActivateGuard('KARTOTEKA')],
    children: []
  },
  {
    path: 'corp-card-replenish',
    loadComponent: () => import('./views/main/features/corp-cards/components/corp-card-replenish/corp-card-replenish.component').then((m) => m.CorpCardReplenishComponent),
    data: { animation: 'corp-card-replenish' },
    canActivate: [NotAuthorizedGuard]
  },
  {
    path: 'corp-card-transaction-history',
    loadComponent: () => import('./views/main/features/corp-cards/components/corp-card-transaction-history/corp-card-transaction-history.component').then((m) => m.CorpCardTransactionHistoryComponent),
    data: { animation: 'corp-card-transaction-history' },
    canActivate: [NotAuthorizedGuard]
  },
  {
    path: 'corp-cards/transactions/:id',
    loadComponent: () => import('./views/main/features/corp-cards/components/corp-card-transactions/corp-card-transactions.component').then((m) => m.CorpCardTransactionsComponent),
    data: { animation: 'corp-card-transaction' },
    canActivate: [NotAuthorizedGuard]
  },
  {
    path: 'security',
    loadComponent: () => import('./views/main/features/profile/components/security/security.component').then(m => m.SecurityComponent),
    data: { animation: 'security' },
    canActivate: [NotAuthorizedGuard]
  },
  {
    path: 'my-office',
    loadComponent: () => import('./views/main/features/my-office/my-office.component').then((m) => m.MyOfficeComponent),
    data: { animation: 'my-office', permissions: ['MYOFFICE'] },
    canActivate: [NotAuthorizedGuard, PermissionGuard],
    children: [
      {
        path: '',
        redirectTo: 'main',
        pathMatch: 'full'
      },
      {
        path: 'main',
        component: MyOfficeMainComponent,
        data: { animation: 'main' }
      },
      {
        path: 'payments',
        component: MyOfficePaymentComponent,
        data: { animation: 'payments' }
      },
    ]
  },
  {
    path: 'chat',
    loadComponent: () => import('./views/main/features/chat/chat.component').then((m) => m.ChatComponent),
    data: { animation: 'chat' },
    canActivate: [NotAuthorizedGuard],
    children: [
      {
        path: '',
        redirectTo: 'faq',
        pathMatch: 'full'
      },
      {
        path: 'faq',
        component: ChatFaqComponent,
        data: { animation: 'faq' }
      },
      {
        path: 'conversation',
        component: ChatConversationComponent,
        data: { animation: 'conversation' }
      },
    ]
  },
  {
    path: 'profile',
    loadComponent: () => import('./views/main/features/profile/profile.component').then((m) => m.ProfileComponent),
    data: { animation: 'profile' },
    canActivate: [NotAuthorizedGuard],
    children: [
      {
        path: '',
        redirectTo: 'me',
        pathMatch: 'full'
      },
      {
        path: 'me',
        component: MeComponent,
        data: { animation: 'me' }
      },
    ]
  },
  {
    path: 'profile/change-business',
    loadComponent: () => import('./views/main/features/main/components/business-change/business-change.component')
      .then((m) => m.NewBusinessChangeComponent),
    data: { animation: 'business-change' },
    canActivate: [NotAuthorizedGuard],
  },
  {
    path: 'settings',
    loadComponent: () => import('./views/main/features/new-settings/settings.component').then((m) => m.SettingsComponent),
    data: { animation: 'settings' },
    canActivate: [NotAuthorizedGuard],
    children: [
      {
        path: '',
        redirectTo: 'my-profile',
        pathMatch: 'full'
      },
      {
        path: 'my-profile',
        component: MyProfileComponent,
        data: { animation: 'my-profile' },
        canActivate: [NotAuthorizedGuard],
      },
      {
        path: 'notifications',
        component: MyNotificationsComponent,
        data: { animation: 'notifications' },
        canActivate: [NotAuthorizedGuard],
      },
      {
        path: 'organization',
        component: OrganizationComponent,
        data: { animation: 'organization' },
        canActivate: [NotAuthorizedGuard],
      },
      {
        path: 'e-signature',
        component: ESignatureComponent,
        data: { animation: 'e-signature' },
        canActivate: [NotAuthorizedGuard],
      },
      {
        path: 'security',
        component: SecurityComponent,
        data: { animation: 'security' },
        canActivate: [NotAuthorizedGuard],
      },
      {
        path: 'users',
        component: UsersComponent,
        data: { animation: 'users' },
        canActivate: [NotAuthorizedGuard],
      },
      {
        path: 'routers',
        component: RoutersComponent,
        data: { animation: 'routers' },
        canActivate: [NotAuthorizedGuard],
      },
      {
        path: 'bank-info',
        component: BankInfoComponent,
        data: { animation: 'bank-info' },
        canActivate: [NotAuthorizedGuard],
      }
    ]
  },
  {
    path: 'templates',
    loadComponent: () => import('./views/main/features/template-transactions/template-transactions.component').then((m) => m.TemplateTransactionsComponent),
    data: { animation: 'templates' },
    canActivate: [NotAuthorizedGuard, canActivateGuard('TEMPLATES')],
  },
  {
    path: 'charts',
    loadChildren: () => import('./views/main/features/accounts-payments/components/statements-history-v2/statement-history-v2.route').then(m => m.STATEMENT_HISTORY_V2_ROUTES),
    data: { animation: 'charts' },
    canActivate: [NotAuthorizedGuard, canActivateGuard('STATEMENTS')],
  },
  {
    path: 'reports',
    data: { animation: 'reports' },
    canActivate: [NotAuthorizedGuard, canActivateGuard('STATEMENTS'), canViewForCodeGuard('04767099')],
    loadComponent: () => import('./views/main/features/new-settings/settings.component').then((m) => m.SettingsComponent),
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
      },
      {
        path: 'list',
        data: { animation: 'list' },
        canActivate: [NotAuthorizedGuard, canActivateGuard('STATEMENTS')],
        loadComponent: () => import('./views/main/features/accounts-payments/components/statements-history-v2/components/report-list-v2/report-list-v2.component')
      },
      {
        path: 'create',
        data: { animation: 'create' },
        canActivate: [NotAuthorizedGuard, canActivateGuard('STATEMENTS')],
        loadComponent: () => import('./views/main/features/accounts-payments/components/statements-history-v2/components/create-statement/components/create-new-report-v2.component')
      },
    ]
  },
  {
    path: 'ved-conversion',
    loadComponent: () => import('./views/main/features/ved/components/conversion/conversion.component').then((m) => m.ConversionComponent),
    data: { animation: 'ved-conversion' },
    canActivate: [NotAuthorizedGuard],
    children: [
      { path: '', redirectTo: 'all', pathMatch: 'full' },
      {
        path: 'all',
        loadComponent: () => import('./views/main/features/ved/components/conversion/pages/all/conversion-all.component').then(m => m.ConversionAllComponent),
      },
      {
        path: 'na-podpis',
        loadComponent: () => import('./views/main/features/ved/components/conversion/pages/signature/conversion-signature.component').then(m => m.ConversionSignatureComponent),
      },
      {
        path: 'na-dorabotke',
        loadComponent: () => import('./views/main/features/ved/components/conversion/pages/under-dev/conversion-under-dev.component').then(m => m.ConversionUnderDevComponent),
      },
      {
        path: 'oshibka',
        loadComponent: () => import('./views/main/features/ved/components/conversion/pages/error/conversion-error.component').then(m => m.ConversionErrorComponent),
      },
    ],
  },
  {
    path: 'letters-of-credit',
    loadComponent: () => import('./views/main/features/letters-of-credit/letters-of-credit.component').then((m) => m.LettersOfCreditComponent),
    data: { animation: 'letters-of-credit', permissions: ['ACCREDIT'] },
    canActivate: [NotAuthorizedGuard, PermissionGuard],
  },
  {
    path: 'letters-of-credit/create',
    loadComponent: () => import('./views/main/features/letters-of-credit/components/create-letters-of-credit/create-letters-of-credit.component').then((m) => m.CreateLettersOfCreditComponent),
    data: { animation: 'create-letters-of-credit', permissions: ['ACCREDIT'] },
    canActivate: [NotAuthorizedGuard, PermissionGuard],
  },
  {
    path: 'letters-of-credit/detail/:id',
    loadComponent: () => import('./views/main/features/letters-of-credit/components/detail-letters-of-credit/detail-letters-of-credit.component').then((m) => m.DetailLettersOfCreditComponent),
    data: { animation: 'detail-letters-of-credit', permissions: ['ACCREDIT'] },
    canActivate: [NotAuthorizedGuard, PermissionGuard],
  },
  {
    path: 'letters-of-credit/edit/:id',
    loadComponent: () => import('./views/main/features/letters-of-credit/components/edit-letters-of-credit/edit-letters-of-credit.component').then((m) => m.EditLettersOfCreditComponent),
    data: { animation: 'edit-letters-of-credit', permissions: ['ACCREDIT'] },
    canActivate: [NotAuthorizedGuard, PermissionGuard],
  },
  {
    path: 'notification',
    loadComponent: () => import('./views/main/features/notifications/notifications.component').then((m) => m.NotificationsComponent),
    data: { animation: 'notification' },
    canActivate: [NotAuthorizedGuard],
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
      },
      {
        path: 'list',
        component: NotificationListComponent,
        data: { animation: 'notifications' }
      },
    ]
  },
  ...OPERATIONS_ROUTES,
  {
    path: '**',
    redirectTo: 'auth'
  }
]
