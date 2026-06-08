import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, Input, OnInit, signal } from '@angular/core';
import { AccountsPaymentsService } from '../../../accounts-payments/services/accounts-payments.service';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { AccountPaymentComponent } from '../account-payment/account-payment.component.';
import { MatExpansionModule } from '@angular/material/expansion';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import {
  MAIN_PAYMENT_TABS, MainPaymentTabKey,
  PAYMENT_TABS,
  PaymentTabKey,
} from "../../../new-main/constants/new-main.const";
import { getGroupedTransactions } from "../../../../../../core/utils";
import { AccountService } from "../../../../../../core/services/account.service";
import { FilterPaymentComponent } from "../../../../../../shared/components/filter-payment/filter-payment.component";
import {TranslateModule, TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-account-payments',
  imports: [
    NgForOf,
    AccountPaymentComponent,
    MatExpansionModule,
    InfiniteScrollDirective,
    NgClass,
    NgIf,
    FilterPaymentComponent,
    TranslateModule
  ],
  templateUrl: './account-payments.component.html',
  styles: ``,
  styleUrls: ['./account-payments.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountPaymentsComponent implements OnInit {
  @Input() accountNumber?: string;
  reloading = false;
  pageIndex = 0;
  pageSize = 10;
  totalItems = 0;





  currentPage = 0;

  panelState = false;
  errorMessage = '';

  grouped!: any;
  transactions = signal<any[]>([])
  transactionsForSigniture = computed(() => {
    this.transactions().filter(g => g.canUserSign == true)
  })

  loading = false;
  transactionsArray!: any[];
  public readonly activeTabs = signal<PaymentTabKey>('all');
  public readonly activeMainTabs = signal<MainPaymentTabKey>('history');

  signatureCount = signal(0);
  autoPayCount: number = 0;

  groupedSignature!: any;
  constructor(
    private accountsPayments: AccountsPaymentsService,
    private accountService: AccountService,
    private accountsPaymentsService: AccountsPaymentsService,
    private _cdRef: ChangeDetectorRef,
    private translate: TranslateService,
  ) {
  }


  filter: any;
  ngOnInit(): void {
    this.getPayments(0)
  }

  setFilter(value: any) {
    this.reloading = true;
    this.filter = value;
    this.filter.senderAccount = this?.accountNumber
    // this.filter.receiverAccount = this?.accountNumber
    this.getPayments(0);
  }

  getTransactionReload(event: string) {
    if (event === 'sign') this.getPayments(0)
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

  setPaymentActiveTab(k: PaymentTabKey) {
    this.loading = true;
    this.filter = {
      transactionModes: null,
      fromAmount: null,
      senderAccount: null,
      toAmount: null,
      startDate: null,
      endDate: null,
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
    }
  }


  getPaymentsSignature(currentPage: number) {
    this.loading = true;
    if (this.reloading) {
      this.transactionsArray = [];
      this.grouped = Object.entries(getGroupedTransactions(this.transactionsArray, this.translate));
    }
    this._cdRef.detectChanges();
    const filter = {
      ...this.filter,
      fullHistory: true,
      statuses: ["PREPARE"],
      isSignable: true,
      senderAccount: this.accountNumber,
      receiverAccount: this.accountNumber,
      startDate: this.filter?.startDate ? this.setStartOfDay(this.filter?.startDate) : null,
      endDate: this.filter?.endDate? this.setEndOfDay(this.filter?.endDate) : null,
    };

    this.accountsPayments.getTransactionList(
      {
        page: currentPage,
        size: this.pageSize,
      },
      filter
    ).subscribe({
      next: val => {
        if (val) {
          this.signatureCount.set(val.totalElements)
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
            this.groupedSignature = Object.entries(getGroupedTransactions(this.transactionsArray, this.translate));
          }
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


  getPayments(currentPage: number) {
    if (!this.accountNumber) return
    this.loading = true;
    if (this.reloading) {
      this.transactionsArray = [];
      this.grouped = Object.entries(getGroupedTransactions(this.transactionsArray, this.translate));
      if (this.grouped && this.grouped.length && this.grouped.length > 0) {
        this.transactions.set(this.grouped[1])
      }

    }
    this._cdRef.detectChanges();
    // this.accountsPaymentsService.getTransactionList
    // this.accountService.getAccountHistoryById(
    this.accountsPaymentsService.getTransactionList(
      {
        page: currentPage,
        size: this.pageSize,
      },
      {
        ...this.filter,
        statuses: [
          "PREPARE",
          "REVERTED",
          "SUCCESS",
          "ERROR",
          "IN_PROCESS",
          "PAYED",
          "DELETED_BY_BANK",
          "CANCEL",
        ],
        fullHistory: true,
        senderAccount: this.accountNumber,
        receiverAccount: this.accountNumber,
        startDate: this.filter?.startDate ? this.setStartOfDay(this.filter?.startDate) : null,
        endDate: this.filter?.endDate? this.setEndOfDay(this.filter?.endDate) : null,
      },
    ).subscribe({
      next: val => {
        if (val) {
          this.totalItems = val?.totalElements;
          this.pageSize = val?.pageable?.pageSize;
          this.pageIndex = val?.pageable?.pageNumber;
          const content = val?.content
          if (Array.isArray(content)) {
            if (currentPage === 0) {
              this.transactionsArray = content;
            } else {
              this.transactionsArray = [...this.transactionsArray, ...content];
            }
            this.errorMessage = '';

            this.grouped = Object.entries(getGroupedTransactions(this.transactionsArray, this.translate));
            if (this.grouped && this.grouped.length && this.grouped.length > 0) {
              this.transactions.set(this.grouped[1])
            }

            // console.log('grouped', this.grouped)
          }
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
    })
  }





  onScroll() {
    if (this.totalItems === this.transactionsArray?.length) {
      return;
    }
    this.currentPage++;
    if (this.activeTabs() == 'all') {
      this.getPayments(this.currentPage);
    } else {
      this.getPaymentsSignature(this.currentPage)
    }

  }

  formatDateFromFilterForm(date: Date): string {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
  }

  protected readonly Object = Object;
  protected readonly JSON = JSON;
  protected readonly Number = Number;
  protected readonly PAYMENT_TABS = PAYMENT_TABS.filter(p => p.key != 'autoPay');
  protected readonly MAIN_PAYMENT_TABS = MAIN_PAYMENT_TABS;
}
