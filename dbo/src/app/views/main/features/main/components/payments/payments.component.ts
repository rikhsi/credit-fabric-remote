import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  effect,
  input,
  OnInit,
  signal
} from '@angular/core';
import {AccountsPaymentsService} from '../../../accounts-payments/services/accounts-payments.service';
import {NgClass, NgForOf, NgIf, NgOptimizedImage} from '@angular/common';
import {PaymentComponent} from '../payment/payment.component';
import {MatExpansionModule} from '@angular/material/expansion';
import {FilterPaymentComponent} from '../../../../../../shared/components/filter-payment/filter-payment.component';
import {InfiniteScrollDirective} from 'ngx-infinite-scroll';
import {
  LOAN_TABS,
  MAIN_PAYMENT_TABS, MainPaymentTabKey,
  PAYMENT_TABS,
  PaymentTabKey,
} from "../../../new-main/constants/new-main.const";
import {getGroupedTransactions} from "../../../../../../core/utils";
import {ActivatedRoute, Router} from "@angular/router";
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {PaymentService} from "../../../../../../core/services/payment.service";
import {TransactionDetailComponent} from "../../../transaction-detail/transaction-detail.component";
import {MatDialog} from "@angular/material/dialog";
import {ToastrService} from "ngx-toastr";
import {FirebaseAnalyticsService} from "../../../../../../../../firebase-analytics.service";
import { DatePickerMode, InputSize } from 'src/app/shared/components/date-picker-default/date-picker-default.component';
import {DeleteModalComponent} from "../../../../../../shared/components/delete-modal/delete-modal.component";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {TransactionService} from "../../../../../../core/services/transaction.service";
import {HistorySignModalComponent} from "../../../../../../shared/components/history-sign-modal/history-sign-modal";
import {PreparePaymentUzsTransactionResponse} from "../../../../../../entities/transaction/transaction.model";
import {UserService} from "../../../../../../core/services/user.service";
import {MatTooltip} from "@angular/material/tooltip";
import {ICONS_TYPE} from "../../../../../../shared/types";

@Component({
  selector: 'app-payments',
  imports: [
    NgForOf,
    PaymentComponent,
    FilterPaymentComponent,
    MatExpansionModule,
    FilterPaymentComponent,
    InfiniteScrollDirective,
    NgClass,
    NgIf,
    TranslateModule,
    NgOptimizedImage,
    MatTooltip
  ],
  templateUrl: './payments.component.html',
  styles: ``,
  styleUrls: ['./payments.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentsComponent implements OnInit {
  transactionMode = input<string>()
  loanId = input<any>(null);
  isCalendarRange = input<boolean>(false)
  calendarInputSize = input<InputSize>('small')
  accountSelectMode = input<'single'|'multi'>('single')
  reloading = false;
  pageIndex = 0;
  pageSize = 10;
  totalItems = 0;
  totalItemsForSignature = 0;
  totalItemsAutoPay = 0;

  currentPage = 0;

  panelState = false;
  errorMessage = '';
  signatureCount: number = 0;
  autoPayCount: number = 0;

  isSelectionMode = false;
  allSelected = false;
  setSelectedFromTable: { amount: number; id: string }[] = [];

  grouped!: any;
  groupedSignature!: any;
  groupedAutoPay!: any;
  loading = false;
  transactionsArray!: any[];
  selectedAmount: number = 0;
  permissionsList = signal<{ module: string, types: [string] }[]>([]);
  public readonly activeTabs = signal<PaymentTabKey>('all');
  totalAmountToPrepare = signal<number>(0);
  isFiltering = signal<boolean>(false);
  public readonly activeMainTabs = signal<MainPaymentTabKey>('history');

  constructor(
    private accountsPayments: AccountsPaymentsService,
    private _cdRef: ChangeDetectorRef,
    protected route: ActivatedRoute,
    protected router: Router,
    private translateService:TranslateService,
    private paymentService: PaymentService,
    private _matDialog: MatDialog,
    private toast: ToastrService,
    private userService: UserService,
    private analyticsService: FirebaseAnalyticsService,
    private transactionService: TransactionService,
    private destroyRef: DestroyRef,
  ) {

      effect(() => {
      const loanId = this.loanId();
      const mode = this.transactionMode();
      if (loanId !== null || mode !== undefined) {
        this.resetAndReload();
      }
    });

  }

  filter: any;

  DEFAULT_FILTER = {
    startDate: null,
    endDate: null,
    type: "ANY",
    docNum: null,
    searchText: "",
    senderAccount: null,
    receiverAccount: null,
    inn: null,
    receiverName: null,
    fromAmount: 0,
    toAmount: null,
    filterByCorporateCard: null,
    currency: null,
    statuses: null,
    transactionModes: null,
    transactionStepFilter: null,
    senderAccounts: null,
    receiverAccounts: null,
  };

  ngOnInit(): void {
    const permissions = this.userService.getPermissions();
    if (permissions) {
      this.permissionsList.set(JSON.parse(permissions));
    }
    this.routerListener()
    if (this.route.snapshot.queryParams['tab']) {
      this.setPaymentActiveTab(this.route.snapshot.queryParams['tab'])
    }
    this.getPaymentsSignatureGetCount();
    this.getPaymentsAutoPayGetCount();

  }

  private getCurrentList(): any[] | undefined {
  if (this.checkUrl()) {
    const tab = this.activeTabs();
    if (tab === 'all') return this.grouped;
    if (tab === 'signature') return this.groupedSignature;
    return this.groupedAutoPay;
  }

  if(this.loanId()) {
     const tab = this.activeTabs();
    if (tab === 'all') return this.grouped;
    if (tab === 'signature') return this.groupedSignature;
    return this.groupedAutoPay;
  }

  const tab = this.activeMainTabs();
  if (tab === 'history') return this.grouped;
  if (tab === 'signature') return this.groupedSignature;
  return this.groupedAutoPay;
}

isEmptyResult(): boolean {
  return !(this.getCurrentList()?.length);
}


  selectedFromTableFunc(transaction: any) {
   return this.setSelectedFromTable.some(t => t.id === transaction.id)
  }


  showPriceAndCount() {
    if (this.checkUrl()) {
    return this.activeTabs() === 'all' ? this.grouped?.length : this.activeTabs() === 'signature' ? this.groupedSignature?.length : this.groupedAutoPay?.length
    } else {
    return !this.isEmptyResult()
    }
  }


   private resetAndReload() {
    this.currentPage = 0;
    this.transactionsArray = [];
    this.grouped = [];
    this.filter = {
      transactionModes: null,
      fromAmount: null,
      senderAccount: null,
      toAmount: null,
      startDate: null,
      endDate: null,
          receiverAccount: this.loanId() ?? null,
    };

    const activeTab = this.checkUrl() ? this.activeTabs() : this.activeMainTabs();

    if (activeTab === 'signature') {
      this.getPaymentsSignature(0);
      this.getPaymentsSignatureGetCount();
    } else if (activeTab === 'all' || activeTab === 'history') {
      this.getPayments(0);
    } else if (activeTab === 'autoPay') {
      this.getAutoPayments(0);
      this.getPaymentsAutoPayGetCount();
    }
  }

  permissionsToActionsInAccounts(): boolean {
    const module  = this.permissionsList()?.find(permission => permission.module === 'ACCOUNTS')
    if (module) {
      return module.types.includes('ACTION')
    }
    return false
  }

  permissionsToActionsInCards(): boolean {
    const module  = this.permissionsList()?.find(permission => permission.module === 'CARDS')
    if (module) {
      return module.types.includes('ACTION')
    }
    return false
  }

  routerListener(): void {
    this.route.queryParams.subscribe(params => {
      const dialogAction = params['dialogAction'];
      const type = params['type'];
      const actionId = params['actionId'];
      if (dialogAction === 'on' && type === 'transaction') {
        this.handleTransaction(actionId);
        this.clearUrl()
      } });
 }
  handleTransaction(actionId: string) {
    if (!actionId) return
    this.paymentService.getTransactionOne(actionId).pipe()
      .subscribe({
        next: (res: any) => {
          if (res){
            this.showDetails(res)
          }

        },
        error: error => {
          this.toast.error(error?.message);
        }
      })
  }
  clearUrl() {
    this.router.navigate(['/main'], {
      replaceUrl: true
    });
  }
  showDetails(transaction) {
    if(transaction.transactionMode == 'FILE_TRANSACTION_PARENT') {
      this.router.navigate(
        ['/payment/mass-payments/created-payments', transaction.massFileId],
        {
          queryParams: {
            transactionGroupUuid: transaction.id,
            type: 'all'
          }
        }
      );
    }else {
      // if (this.onClickShowDetail && !this.setSelected) {
        const dialog = this._matDialog.open(TransactionDetailComponent, {
          width: '475px',
          height: '100%',
          position: {right: '0'},
          panelClass: 'right-side-dialog',
          data: transaction,
        });
        dialog.componentInstance.onDetail.subscribe(res => {
          dialog.close();
        });
        dialog.afterClosed().subscribe(() => {
        })
      // }
    }
  }

  onSelectionChange(event: { id: string; amount: number; checked: boolean }) {
    if (event.checked) {
      this.setSelectedFromTable.push({ id: event.id, amount: event.amount });
    } else {
      this.setSelectedFromTable = this.setSelectedFromTable.filter(t => t.id !== event.id);
    }
    this.allSelected = this.setSelectedFromTable.length === this.transactionsArray.length;
    this.selectedAmount = this.setSelectedFromTable.reduce((acc, cur) => acc + cur.amount, 0) / 100;
    this._cdRef.detectChanges();
  }

  toggleSelectAll() {
    if (this.allSelected) {
      this.setSelectedFromTable = [];
      this.allSelected = false;
    } else {
      this.setSelectedFromTable = this.transactionsArray.map(t => ({
        id: t.id,
        amount: t.isDebit ? t.senderAmount.amount : t.receiverAmount.amount
      }));
      this.allSelected = true;
    }
    this._cdRef.detectChanges();
  }


  isFilterActive(currentFilter) {
    return Object.keys(this.DEFAULT_FILTER).some(
      (key) => currentFilter[key] !== this.DEFAULT_FILTER[key]
    );
  }

  setFilter(value: any) {
    this.isFiltering.set(this.isFilterActive(value));
    this.reloading = true;
    this.filter = value;
    if (this.loanId()) {
    this.filter.receiverAccount = this.loanId();
   }

     if (this.transactionMode()) {
    this.filter.transactionModes = [this.transactionMode()];
  }

    this.currentPage = 0;
    if (this.activeTabs() === 'signature') {
      this.getPaymentsSignature(0)
      this.getPaymentsSignatureGetCount();
      return
    } else if (this.activeTabs() === 'all') {
      return this.getPayments(0);
    } else if (this.activeTabs() === 'autoPay') {
      this.getAutoPayments(0)
      this.getPaymentsAutoPayGetCount();
      return
    }
    this.reloading = false;
    this._cdRef.detectChanges();
  }

  setFilterMain(value: any) {
    this.reloading = true;
    this.filter = value;
    if (this.activeMainTabs() === 'signature') {
      this.getPaymentsSignature(0)
      this.getPaymentsSignatureGetCount();
      this.analyticsService.logFirebaseCustomEvent('signing_screen_jump', {
        screen:"main"
      });
      return
    } else if (this.activeMainTabs() === 'history') {
      return this.getPayments(0);
    } else if (this.activeMainTabs() === 'autoPay') {
      this.analyticsService.logFirebaseCustomEvent('planned_screen_jump', {
        screen:"main"
      });
      this.getAutoPayments(0)
      this.getPaymentsAutoPayGetCount();
      return
    }
  }

  getTransactionReload(event:string){
    if (event === 'sign'){
      this.currentPage = 0;
      if (this.activeTabs() === 'signature') {
         this.getPaymentsSignature(0)
         this.getPaymentsSignatureGetCount();
         return
      } else if (this.activeTabs() === 'all') {
        return this.getPayments(0);
      } else if (this.activeTabs() === 'autoPay') {
        this.getAutoPayments(0);
        this.getPaymentsAutoPayGetCount();
        return
      }
      this._cdRef.detectChanges();
    }
  }

  deleteTransactions() {
    const ids: string[] = [];
    this.setSelectedFromTable.forEach((transaction) => {
      ids.push(transaction.id);
    })
    this._matDialog.open(DeleteModalComponent, {
      data: {
        title: 'Вы уверены что хотите удалить платеж?',
        agree: 'Удалить',
        cancel: 'Нет',
      }
    }).afterClosed()
      .subscribe({
        next: (res: any) => {
          if(res === 'agree') {
            this.transactionService.deleteTransaction(ids).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
              next: (res) => {
                this.toast.success(res.msg);
                this.resetAndReload()
                this.isSelectionMode = false;
                this.setSelectedFromTable = []
                this._cdRef.detectChanges();
              },
              error: (err) => {
                const message = err.message || err || this.translateService.instant('acc.unknown_error');
                this.toast.error(message)
              }
            })
          }
        }
      })


  }


  getTransactionReloadMain(event:string){
    if (event === 'sign'){
      this.currentPage = 0;
      if (this.activeMainTabs() === 'signature') {
        this.getPaymentsSignature(0)
        this.getPaymentsSignatureGetCount();
        return
      } else if (this.activeMainTabs() === 'history') {
        return this.getPayments(0);
      } else if (this.activeMainTabs() === 'autoPay') {
        this.getAutoPayments(0);
        this.getPaymentsAutoPayGetCount();
        return
      }
      this._cdRef.detectChanges();
    }
  }
  checkUrl() {
    return window.location.pathname === '/history';
  }

  private setStartOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return this.normalizeLocalTime(d);
  }

  private setEndOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return this.normalizeLocalTime(d);
  }

  private normalizeLocalTime(date: Date): Date {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  }

  getPayments(currentPage: number) {
    this.loading = true;
    if (this.reloading) {
      this.transactionsArray = [];
      this.grouped = Object.entries(getGroupedTransactions(this.transactionsArray, this.translateService));
    }

    this._cdRef.detectChanges();
    const filter = {
      ...this.filter,
      fullHistory: true,
      statuses: this.filter.statuses ? this.filter.statuses : [
        "PREPARE",
        "REVERTED",
        "SUCCESS",
        "ERROR",
        "IN_PROCESS",
        "PAYED",
        "DELETED_BY_BANK",
        "CANCEL",
        "FILE_MASSIVE_SUCCESS",
        "FILE_MASSIVE_PARTIAL_SUCCESS",
        "FILE_MASSIVE_PENDING",
        "FILE_MASSIVE_ERROR",
        "FILE_EXECUTED",
        "FILE_PARTIALLY_EXECUTED",
        "POSTING_ERROR"
      ],
      ...(this.transactionMode() ? { transactionModes: [this.transactionMode()] } : {}),
      startDate: this.filter.startDate ? this.setStartOfDay(this.filter.startDate) : null,
      endDate: this.filter.endDate? this.setEndOfDay(this.filter.endDate) : null,

    };

    if(this.loanId()){
      filter.receiverAccount = this.loanId()
    }

      this.accountsPayments.getTransactionList(
      {
        page: currentPage,
        size: this.pageSize,
      },
      filter
    ).subscribe({
      next: val => {
        this.loading = false;
        if (val) {
          this.totalItems = val.totalElements;
          this.pageSize = val.pageable.pageSize;
          this.pageIndex = val.pageable.pageNumber;
          const content = val?.content;
          if (Array.isArray(content)) {
            if (currentPage === 0) {
              this.transactionsArray = content;
            } else {
              this.transactionsArray = [...this.transactionsArray, ...content];
            }
            this.errorMessage = '';
            this.grouped = Object.entries(getGroupedTransactions(this.transactionsArray, this.translateService));
          }
          this._cdRef.detectChanges();
        }
      },
      error: (err: any) => {
        this.errorMessage = err.message;
        this.loading = false;
        this.reloading = false;
        this._cdRef.detectChanges();
      },
      complete: () => {
        this.loading = false;
        this.reloading = false;
        this._cdRef.markForCheck();
      }
    });
  }
  getAutoPayments(currentPage: number) {
    this.loading = true;
    if (this.reloading) {
      this.transactionsArray = [];
      this.grouped = Object.entries(getGroupedTransactions(this.transactionsArray, this.translateService));
    }

    this._cdRef.detectChanges();
    const filter = {
      ...this.filter,
      fullHistory: true,
      statuses: ['AUTO_PAY'],
      ...(this.transactionMode() ? { transactionModes: [this.transactionMode()] } : {}),
      startDate: this.filter.startDate ? this.setStartOfDay(this.filter.startDate) : null,
      endDate: this.filter.endDate? this.setEndOfDay(this.filter.endDate) : null,
    };

    if(this.loanId()) {
        filter.receiverAccount = this.loanId();
    }

    this.accountsPayments.getTransactionList(
      {
        page: currentPage,
        size: this.pageSize,
      },
      filter
    ).subscribe({
      next: val => {
        this.loading = false;
        if (val) {
          this.totalItemsAutoPay = val.totalElements;
          this.pageSize = val.pageable.pageSize;
          this.pageIndex = val.pageable.pageNumber;
          const content = val?.content;
          if (Array.isArray(content)) {
            if (currentPage === 0) {
              this.transactionsArray = content;
            } else {
              this.transactionsArray = [...this.transactionsArray, ...content];
            }
            this.errorMessage = '';
            this.groupedAutoPay = Object.entries(getGroupedTransactions(this.transactionsArray, this.translateService));
          }
          this._cdRef.detectChanges();
        }
      },
      error: (err: any) => {
        this.errorMessage = err.message;
        this.loading = false;
        this.reloading = false;
        this._cdRef.markForCheck();
      },
      complete: () => {
        this.loading = false;
        this.reloading = false;
        this._cdRef.markForCheck();
      }
    });
  }

  getPaymentsAutoPayGetCount() {
    this.loading = true;
    if (this.reloading) {
      this.transactionsArray = [];
      this.grouped = Object.entries(getGroupedTransactions(this.transactionsArray, this.translateService));
    }

    this._cdRef.detectChanges();
    const filter = {
      ...this.filter,
      fullHistory: true,
      statuses: ['AUTO_PAY'],
      ...(this.transactionMode() ? { transactionModes: [this.transactionMode()] } : {}),
      startDate: this.filter.startDate ? this.setStartOfDay(this.filter.startDate) : null,
      endDate: this.filter.endDate? this.setEndOfDay(this.filter.endDate) : null,
    };

    if(this.loanId()){
       filter.receiverAccount = this.loanId();
    }

    this.accountsPayments.getTransactionList(
      {
        page: 0,
        size: 100,
      },
      filter
    ).subscribe({
      next: val => {
        this.loading = false;
        if (val) {
          this.autoPayCount = val.totalElements
        }
      },
      error: (err: any) => {
        this.errorMessage = err.message;
        this.loading = false;
        this.reloading = false;
        this._cdRef.markForCheck();
      },
      complete: () => {
        this.loading = false;
        this.reloading = false;
        this._cdRef.markForCheck();
      }
    });
  }

  getPaymentsSignature(currentPage: number) {
    this.loading = true;
    if (this.reloading) {
      this.transactionsArray = [];
      this.grouped = Object.entries(getGroupedTransactions(this.transactionsArray, this.translateService));
    }
    this._cdRef.detectChanges();
    const filter = {
      ...this.filter,
      fullHistory: true,
      statuses: ["PREPARE"],
      isSignable: true,
      startDate: this.filter.startDate ? this.setStartOfDay(this.filter.startDate) : null,
      endDate: this.filter.endDate? this.setEndOfDay(this.filter.endDate) : null,
          ...(this.transactionMode() ? { transactionModes: [this.transactionMode()] } : {}),

    };
   if(this.loanId()){
       filter.receiverAccount = this.loanId();
    }

    this.accountsPayments.getTransactionList(
      {
        page: currentPage,
        size: this.pageSize,
      },
      filter
    ).subscribe({
      next: val => {
        this.loading = false;
        if (val) {
          if (val.totalSum && (this.activeTabs() === 'signature' || this.activeMainTabs() === 'signature')) {
            this.totalAmountToPrepare.set(val.totalSum)
            this.totalItemsForSignature = val.totalElements;
            this._cdRef.detectChanges();
          }
          this.totalItems = val.totalElements;
          this.pageSize = val.pageable.pageSize;
          this.pageIndex = val.pageable.pageNumber;
          const content = val?.content;
          if (Array.isArray(content)) {
            if (currentPage === 0) {
              this.transactionsArray = content;
            } else {
              this.transactionsArray = [...this.transactionsArray, ...content];
            }
            this.errorMessage = '';
            this.groupedSignature = Object.entries(getGroupedTransactions(this.transactionsArray, this.translateService));
          }
          this._cdRef.detectChanges();
        }
      },
      error: (err: any) => {
        this.errorMessage = err.message;
        this.loading = false;
        this.reloading = false;
        this._cdRef.markForCheck();
      },
      complete: () => {
        this.loading = false;
        this.reloading = false;
        this._cdRef.markForCheck();
      }
    });
  }

  getPaymentsSignatureGetCount() {
    this._cdRef.detectChanges();
    const filter = {
      ...this.filter,
      fullHistory: true,
      statuses: ["PREPARE"],
      isSignable: true,
      startDate: this.filter.startDate ? this.setStartOfDay(this.filter.startDate) : null,
      endDate: this.filter.endDate? this.setEndOfDay(this.filter.endDate) : null,
       ...(this.transactionMode() ? { transactionModes: [this.transactionMode()] } : {}),
    };

   if(this.loanId()){
       filter.receiverAccount = this.loanId();
    }

    this.accountsPayments.getTransactionList(
      {
        page: 0,
        size: 1000,
      },
      filter
    ).subscribe({
      next: val => {
        this.loading = false;
        if (val) {
          this.signatureCount = val.totalElements
        }
      },
      error: (err: any) => {
        this.errorMessage = err.message;
        this.loading = false;
        this.reloading = false;
        this._cdRef.markForCheck();
      },
      complete: () => {
        this.loading = false;
        this.reloading = false;
        this._cdRef.markForCheck();
      }
    });
  }


  setPaymentActiveTab(k: PaymentTabKey) {
    this.loading = true;
    this.filter = {
      transactionModes: null,
      fromAmount: null,
      senderAccount: null,
      toAmount:  null,
      startDate:  null,
      endDate: null,
      receiverAccount: this.loanId() ?? null,
    ...(this.transactionMode() ? { transactionModes: [this.transactionMode()] } :{} ),
    };

    this.activeTabs.set(k);
    this.transactionsArray = [];
    this.grouped = [];
    this.currentPage = 0
    this._cdRef.detectChanges();
    if (k === 'signature') {
      this.getPaymentsSignature(0)
    } else if (k === 'all') {
      this.getPayments(0);
    } else if (k === 'autoPay') {
      this.getAutoPayments(0)
    }
  }

  setMainPaymentActiveTab(k: MainPaymentTabKey) {
    this.loading = true;
    this.filter = {
      transactionModes: null,
      fromAmount: null,
      senderAccount: null,
      toAmount:  null,
      startDate:  null,
      endDate: null,
    };
    this.activeMainTabs.set(k);
    // this.router.navigate([], {
    //   relativeTo: this.route,
    //   queryParams: { tab: k },
    //   queryParamsHandling: 'merge'
    // });
    this.currentPage = 0
    this.transactionsArray = [];
    this.grouped = [];
    this._cdRef.detectChanges();
    // if (k === 'signature') {
    //   this.getPaymentsSignature(0)
    // } else if (k === 'history') {
    //   console.log("setMainPaymentActiveTab")
    //   this.getPayments(0);
    //   console.log("4")
    // } else if (k === 'autoPay') {
    //   console.log("setMainPaymentActiveTab")
    //   this.getAutoPayments(0)
    // }
  }

  onScroll() {
    if (!this.checkUrl()) {
      return
    }
    if (this.totalItems === this.transactionsArray?.length) {
      return;
    }
    if (this.totalItemsAutoPay === this.transactionsArray.length) {
      return;
    }
    this.currentPage++;
    this._cdRef.detectChanges();
    if (this.activeTabs() === 'signature') {
      return this.getPaymentsSignature(this.currentPage)
    } else if (this.activeTabs() === 'all') {
     return this.getPayments(this.currentPage);
    } else if (this.activeTabs() === 'autoPay') {
     return  this.getAutoPayments(this.currentPage)
    }
  }




  protected readonly Object = Object;
  protected readonly JSON = JSON;
  protected readonly Number = Number;
  protected readonly PAYMENT_TABS = PAYMENT_TABS;
  protected readonly MAIN_PAYMENT_TABS = MAIN_PAYMENT_TABS;
  protected readonly LOAN_TABS = LOAN_TABS;

}
