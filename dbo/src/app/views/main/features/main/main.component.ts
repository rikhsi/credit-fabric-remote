import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component, DestroyRef, inject, OnInit, signal,
  ViewEncapsulation,
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BalanceComponent} from './components/balance/balance.component';
import {ExchangeComponent} from './components/exchange/exchange.component';
import {QuickAction} from '../../../../shared/interfaces/quick-action.interface';
import {MatDialog} from '@angular/material/dialog';
import {
  MainQuickActionSettingsComponent
} from '../../../../shared/components/main-quick-action-settings/main-quick-action-settings.component';
import {mainQuickActions} from './constants/main-quick-actions';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {AuthService} from '../../../auth/services/auth.service';
import {mainBalanceSettings} from './constants/main-balance-settings';
import {animate, style, transition, trigger} from "@angular/animations";
import {ScrollableDirective} from "../../../../core/utils/scrollable.directive";
import {AccountsTableColumnsHeaders} from "../accounts-and-payments/constants/table-columns";
import {ContainerTableComponent} from "../../../../shared/components/common/container-table/container-table.component";
import {DashboardTableColumnsHeaders, Transactions} from "../../../../../assets/constants/purpose.const";
import {AccountCardCreditComponent} from "./components/account-card-credit/account-card-credit.component";
import {AccountService} from "../../../../core/services/account.service";
import {AccountsDto} from "../accounts-payments/models/accounts-payments.model";
import {
  AccountsPaymentsDetailsComponent
} from "../accounts-payments/components/accounts-payments-details/accounts-payments-details.component";
import {UtilsService} from "../../../../core/services/utils.service";
import {TableButton} from "../../../../shared/interfaces/table-button.interface";
import {rosterCardTableButton} from "../payroll-project/constants/table-btn";
import {AccountsListPaymentsComponent} from "../add-payment/modals/account-list-modal/account-list-modal.component";
import {TotalBalanceResponse} from "./interfaces/balance-accounts.interface";
import {TransactionService} from "../../../../core/services/transaction.service";
import {FilterAccountComponent} from "../accounts-and-payments/components/filter-account/filter-account.component";
import {FilterButtonComponent} from "../../../../shared/components/common/filter-button/filter-button.component";


@Component({
    selector: 'app-main',
  imports: [
    CommonModule,
    BalanceComponent,
    ExchangeComponent,
    ScrollableDirective,
    ContainerTableComponent,
    AccountCardCreditComponent,
    FilterAccountComponent,
    FilterButtonComponent,
  ],
    animations: [
        trigger('expandCollapse', [
            transition(':enter', [
                style({ height: 0, opacity: 0 }),
                animate('300ms ease-out', style({ height: '*', opacity: 1 })),
            ]),
            transition(':leave', [
                animate('300ms ease-in', style({ height: 0, opacity: 0 })),
            ]),
        ]),
    ],
    templateUrl: './main.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class MainComponent implements OnInit {
  private _accountService = inject(AccountService)
  isOpen = signal(true);
  selectedRows = signal<any[]>([])
  paymentsFilterState = false;
  balanceData = signal<TotalBalanceResponse | null>(null);
  balanceDataUSD = signal<TotalBalanceResponse | null>(null)
  balanceDataEUR = signal<TotalBalanceResponse | null>(null)
  balanceDataCHF = signal<TotalBalanceResponse | null>(null)
  balanceDataGBP = signal<TotalBalanceResponse | null>(null)
  balanceDataRUB = signal<TotalBalanceResponse | null>(null)
  operDate = signal<any>({})
  operDaYTime = signal<any>({})
  transactionHistory = signal<any>([])
  tableActionBtns = signal<TableButton[]>(rosterCardTableButton)
  onActionClick(id:string){
    switch (id){
      case 'delete-roster-card':
        return
    }

  }
  onSelectedRows(rows: any) {
    this.selectedRows.set(rows)
    this.toggleForAnyElement()
    this.tableActionBtns.set([...this.tableActionBtns()])
  }
  toggleForAnyElement() {
    if (this.selectedRows().length) {
      this.tableActionBtns().forEach(el => {
        el.active = true;
      });
    } else {
      this.tableActionBtns().forEach(el => {
        el.active = false;
      })
    }
  }
  toggle() {
    this.isOpen.set(!this.isOpen());
  }
  private _utilsService = inject(UtilsService)

  transactionTabs = signal<string[]>(['Все', 'Подписанные', 'На подпись'])
  activeTransactions = signal<number>(0)
  banners = [
    {
      title: 'Расчетный счет',
      subtitle: 'Бесплатное открытие счета',
      image: './assets/images/banner-2.png'
    },
    {
      title: 'Кредиты для бизнеса',
      subtitle: 'На открытие и развитие бизнеса',
      image: './assets/images/banner-1.png'
    }, {
      title: 'Кредиты для бизнеса',
      subtitle: 'На открытие и развитие бизнеса',
      image: './assets/images/banner-1.png'
    },
    {
      title: 'Кредиты для бизнеса',
      subtitle: 'На открытие и развитие бизнеса',
      image: './assets/images/banner-1.png'
    },
    {
      title: 'Кредиты для бизнеса',
      subtitle: 'На открытие и развитие бизнеса',
      image: './assets/images/banner-1.png'
    },

  ];

  constructor(
    private matDialog: MatDialog,
    private destroyRef: DestroyRef,
    private _cdRef: ChangeDetectorRef,
    private authService: AuthService,
    private transactionService: TransactionService,
  ) {
  }

  getAccountBalance() {
    this._accountService.getAccountBalance({ currency: "UZS" }).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.isLoading.set(false)
       if (res?.currentlyAmount){
         this.balanceData.set(res)
       }
      })
  }
  getAccountBalanceEUR() {
    this._accountService.getAccountBalance({ currency: "EUR" }).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.isLoading.set(false)
        this.balanceDataEUR.set(res)
      })
  }
  getAccountBalanceUSD() {
    this._accountService.getAccountBalance({ currency: "USD" }).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.isLoading.set(false)
        this.balanceDataUSD.set(res)
      })
  }
  getAccountBalanceGBP() {
    this._accountService.getAccountBalance({ currency: "GBP" }).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.isLoading.set(false)
        this.balanceDataGBP.set(res)
      })
  }
  getAccountBalanceCHF() {
    this._accountService.getAccountBalance({ currency: "CHF" }).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.isLoading.set(false)
        this.balanceDataCHF.set(res)
      })
  }
  getAccountBalanceRUB() {
    this._accountService.getAccountBalance({ currency: "RUB" }).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.isLoading.set(false)
        this.balanceDataRUB.set(res)
      })
  }

  getTransactionHistory(index: number) {
    this.activeTransactions.set(index)
    this.transactionService.getTransactionHistory({ params: { isSigned: index === 0 ? null : index === 1 }, paging: { page: 0, size: 10 } }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res: any) => {
      this.transactionHistory.set(res.result.data.content)
    })
  }

  quickActions: QuickAction[] = [];
  balanceSettings: QuickAction[] = [];
  isLoading = signal(false)
  accounts = signal<AccountsDto[]>([])

  openSettings() {
    this.matDialog.open(MainQuickActionSettingsComponent, {
      width: '500px',
      height: '100%',
      position: {right: '0'},
      panelClass: 'right-side-dialog',
      data: {
        actions: this.quickActions,
        prop: 'mainQuickAction',
        title: 'Настройки отображения действий',
      }
    }).afterClosed()
      .subscribe({
        next: res => {
          this.getUserSettings();
        }
      })
  }

  openBalanceSettings() {
    this.matDialog.open(MainQuickActionSettingsComponent, {
      width: '500px',
      height: '100%',
      position: {right: '0'},
      panelClass: 'right-side-dialog',
      data: {
        actions: this.balanceSettings,
        prop: 'mainBalanceSettings',
        title: 'Настройки отображения счетов',
      }
    }).afterClosed()
      .subscribe({
        next: res => {
          this.getUserSettings();
        }
      })
  }

  getOperData() {
    this._accountService.getOperDayNew().pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.operDate.set(res)
      })
    this._accountService.getOperDayTimeNew().pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.operDaYTime.set(res)
      })
  }

  ngOnInit(): void {
    // this.getUserSettings();
    this.getAccountList();
    this.getAccountBalance();
    this.getAccountBalanceUSD();
    this.getAccountBalanceGBP();
    this.getAccountBalanceCHF();
    this.getAccountBalanceEUR();
    this.getAccountBalanceRUB();
    this.getOperData();
    this.getTransactionHistory(this.activeTransactions())
  }

  getAccountList() {
    this.isLoading.set(true)
    this._accountService.getAccountListV2({
      size: 100,
      page: 0
    }, {})
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.isLoading.set(false)
        if (!res) return
        this.accounts.set(res.content)
      })
  }

  getUserSettings() {
    this.authService.getUserSettings()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const actions = res?.widget?.mainQuickAction;
          const balanceSettings = res?.widget?.mainBalanceSettings;
          if (actions) {
            this.quickActions = actions;
          } else {
            this.quickActions = mainQuickActions;
          }

          if (balanceSettings && balanceSettings.length === mainBalanceSettings.length) {
            this.balanceSettings = balanceSettings;
          } else {
            this.balanceSettings = mainBalanceSettings;
          }
          this._cdRef.markForCheck();
        },
        error: (err) => {
          if (!this.quickActions.length) {
            this.quickActions = mainQuickActions;
          }
          if (!this.balanceSettings.length) {
            this.balanceSettings = mainBalanceSettings;
          }
          this._cdRef.markForCheck();
        },
        complete: () => {
          if (!this.quickActions.length) {
            this.quickActions = mainQuickActions;
          }
          if (!this.balanceSettings.length) {
            this.balanceSettings = mainBalanceSettings;
          }
          this._cdRef.markForCheck();
        }
      })
  }

  openChooseAccountClick() {
    if (this.accounts()) {
      this.matDialog.open(AccountsListPaymentsComponent, {
        data: {
          accounts: this.accounts(),
          isMain: true,
        },
        width: '600px',
        height: '100%',
        position: {
          right: '0',
        },
        panelClass: 'right-side-dialog',
      })
    }
  }

  getInfo(data: {id: string, codeFilial: string, account: string}) {
    this._utilsService.spinnerState$$.next(true);
    localStorage.setItem('accountId', data.id);
    this._accountService.getAccountInfoV2(data).pipe()
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => {
      if (!res) return
      this.matDialog.open(AccountsPaymentsDetailsComponent, {
        data: {...res},
        width: '400px',
        height: 'calc(100% - 16px)',
        position: {
          right: '0',
        },
        panelClass: 'right-side-dialog',
      })
    })
  }
  protected readonly tableColumns = AccountsTableColumnsHeaders;
  protected readonly Transactions = Transactions;
  protected readonly DashboardTableColumnsHeaders = DashboardTableColumnsHeaders;
}
