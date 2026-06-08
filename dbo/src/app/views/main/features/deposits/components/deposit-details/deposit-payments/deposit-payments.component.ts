import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, Input, OnInit, signal } from '@angular/core';
import {NgClass, NgForOf, NgIf, NgOptimizedImage} from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';

import {TranslateModule, TranslateService} from '@ngx-translate/core';
import { DepositPaymentItemComponent } from "./deposit-payment-item/deposit-payment-item.component";
import { MatMenuModule } from "@angular/material/menu";
import { SvgIconComponent } from "src/app/shared/components/svg-icon/svg-icon.component";
import { FilterPaymentComponent } from 'src/app/shared/components/filter-payment/filter-payment.component';
import { DEPOSIT_TABS, DepositPaymentsKey, MainPaymentTabKey } from '../../../../new-main/constants/new-main.const';
import { AccountsPaymentsService } from '../../../../accounts-payments/services/accounts-payments.service';
import { AccountService } from 'src/app/core/services/account.service';
import { getGroupedTransactions } from 'src/app/core/utils';
import {DepositPaymentFilterComponent} from "./deposit-payment-filter/deposit-payment-filter.component";
import {EmptyStateComponent} from "../../../../../../../shared/components/empty-state/empty-state.component";

@Component({
  selector: 'app-deposit-payments',
  imports: [
    NgForOf,
    MatExpansionModule,
    InfiniteScrollDirective,
    NgClass,
    NgIf,
    FilterPaymentComponent,
    TranslateModule,
    DepositPaymentItemComponent,
    MatMenuModule,
    SvgIconComponent,
    DepositPaymentFilterComponent,
    NgOptimizedImage,
    EmptyStateComponent
  ],
  templateUrl: './deposit-payments.component.html',
  styles: `
    .leading-trim {
      leading-trim: both;
      text-edge: cap;
    }

    .mat-expansion-panel:not([class*=mat-elevation-z]) {
      box-shadow: none;
    }

    .border-animation {
      position: relative;
    }

    .border-animation:last-child {
      margin-right: 0;
    }

    .border-animation:after {
      content: '';
      display: block;
      margin: auto;
      height: 4px;
      width: 0;
      background: transparent;
      transition: width .3s ease, background-color .3s ease;
    }

    .border-animation:hover:after {
      width: 100%;
      background: #3D96FF;
    }
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Default
})
export class DepositPaymentsComponent implements OnInit {
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

  loading = signal(false);
  transactionsArray!: any[];
  public readonly activeTabs = signal<DepositPaymentsKey>('all');
  public readonly activeMainTabs = signal<MainPaymentTabKey>('history');

  signatureCount = signal(0);
  autoPayCount: number = 0;
  hasFilter = signal(false)

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

  handleHasFilter(hasFilter: boolean) {
    this.hasFilter.set(hasFilter)
  };

  downloadStatement(type: string) {
  }

  setFilter(value: any) {
    this.reloading = true;
    this.filter = value;
    this.filter.senderAccount = this?.accountNumber
    this.getPayments(0);
  }

  getTransactionReload(event: string) {
    console.log('event', event);
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

  setPaymentActiveTab(k: DepositPaymentsKey) {
    // this.loading.set(true);
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
  }

  getPaymentsSignature(currentPage: number) {
    this.loading.set(true);
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
      endDate: this.filter?.endDate ? this.setEndOfDay(this.filter?.endDate) : null,
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
        this.loading.set(false);
        this.reloading = false;
        this._cdRef.markForCheck();
      },
      complete: () => {
        this.loading.set(false);
        this.reloading = false;
        this._cdRef.markForCheck();
      }
    });
  }

  getPayments(currentPage: number) {
    console.log("currentPage", currentPage)
    console.log(this.accountNumber)
    if (!this.accountNumber) return
    this.loading.set(true);
    if (this.reloading) {
      this.transactionsArray = [];
      this.grouped = Object.entries(getGroupedTransactions(this.transactionsArray, this.translate));
      if (this.grouped && this.grouped.length && this.grouped.length > 0) {
        this.transactions.set(this.grouped[1])
      }
    }
    this._cdRef.detectChanges();
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
        endDate: this.filter?.endDate ? this.setEndOfDay(this.filter?.endDate) : null,
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
          }
        }
      },
      error: (err: any) => {
        this.errorMessage = err.message;
        this.loading.set(false);
        this.reloading = false;
        this._cdRef.markForCheck();
      },
      complete: () => {
        this.loading.set(false);
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
  protected readonly DEPOSIT_TABS = DEPOSIT_TABS
}
