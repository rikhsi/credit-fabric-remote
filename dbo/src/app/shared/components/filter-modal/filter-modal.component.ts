import { log } from '@angular-devkit/build-angular/src/builders/ssr-dev-server';
import {ChangeDetectorRef, Component, DestroyRef, Inject, inject, OnInit, output, signal} from '@angular/core';
import {Router, RouterModule} from '@angular/router';
import {MatCard} from '@angular/material/card';
import {CommonModule, DatePipe, NgClass, NgForOf, NgIf, NgOptimizedImage} from '@angular/common';
import {MAT_DIALOG_DATA, MatDialog, MatDialogClose, MatDialogRef} from '@angular/material/dialog';
import {MatTooltip} from "@angular/material/tooltip";
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatNativeDateModule, MatOption, MatRipple} from '@angular/material/core';
import {MatFormField, MatFormFieldModule} from '@angular/material/form-field';
import {ToastrService} from 'ngx-toastr';
import {MatMenu, MatMenuTrigger} from "@angular/material/menu";
import {AmountService} from "../../../core/services/amount.service";
import {
  AccountsPaymentsService
} from "../../../views/main/features/accounts-payments/services/accounts-payments.service";
import {animate, style, transition, trigger} from "@angular/animations";
import {
  paymentMap, paymentMapNew,
  statusListToMap
} from "../../../views/main/features/transaction-detail/model/transaction-detail.interface";
import {MatDatepicker, MatDatepickerInput} from "@angular/material/datepicker";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {NgxMaskDirective} from "ngx-mask";
import {MatChip, MatChipRemove} from "@angular/material/chips";
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';

@Component({
  selector: 'app-filter-modal',
  templateUrl: './filter-modal.component.html',
  imports: [
    CommonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    NgForOf,
    NgOptimizedImage,
    NgIf,
    MatMenu,
    MatDatepicker,
    MatDatepickerInput,
    NgxMaskDirective,
    MatChip,
    MatChipRemove,
    TranslateModule,
    MatIconModule,
    SvgIconComponent  ,
  ],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scaleY(0.95)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'scaleY(1)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'scaleY(0.95)' }))
      ])
    ])
  ],
  styles: [
    `
      .cdk-overlay-container {
        z-index: 2000 !important;
      }
      ::ng-deep .mat-calendar-body-selected {
        background-color: #00A38D !important;
      }
    `
  ]
})
export class FilterModalComponent implements OnInit {
  public translateService = inject(TranslateService)
  public readonly onDetail = output<string>()
  private cdr = inject(ChangeDetectorRef)
  isOpen: boolean = false;
  isOpenTransaction: boolean = false;
  isOpenStatus: boolean = false;
  filter: any = {
     accounts: [],
    searchText: "",
    account: "",
    type: "ANY",
    status: "",
    from: null,
    to: null,
    fromAmount: "",
    toAmount: "",
  }
  selectedPeriod: 'today' | 'yesterday' | 'week' | 'month' | null = null;

  public actionButtons = signal<{ title: string, icon: string, action: string ,titleKey:string}[]>([
    {
      action: 'sign',
      icon: './assets/new-icons/sign-02.svg',
      title: 'Подписать',
      titleKey:'story.sign'
    },
    {
      action: 'autopay',
      icon: './assets/new-icons/calendar-check-02.svg',
      title: 'Запланировать',
      titleKey:'new.schedule'
    },
    {
      action: 'reverse',
      icon: './assets/new-icons/reverse-right.svg',
      title: 'Повторить',
      titleKey:"main.retry"
    },
    {
      action: 'edit',
      icon: './assets/new-icons/edit.svg',
      title: 'Редактировать',
      titleKey:'loans.edit'
    },
    {
      action: 'delete',
      icon: './assets/new-icons/trash.svg',
      title: 'Удалить',
      titleKey:"loans.delete"
    },


  ])
  user!: any;
  director!: any;
  headOfFinance!: any;

  ngOnInit() {
    this.console.log('data',this.data)
    this.filter = {
      searchText: this.data.filterForm.searchText,
      account: this.data.filterForm.senderAccount,
      accounts: this.data.filterForm.senderAccounts ?? [],
      type: this.data.filterForm.type,
      status: this.data.filterForm.statuses,
      from: this.data.filterForm.startDate,
      filterByCorporateCard: this.data.filterForm.filterByCorporateCard,
      to: this.data.filterForm.endDate,
      fromAmount: this.data.filterForm.fromAmount ?? '',
      toAmount: this.data.filterForm.toAmount ?? '',
    }

    this.console.log('filter',this.filter)

  }
get accountSelectMode(): 'single' | 'multi' {
  return this.data.accountSelectMode ?? 'single';
}

isAccountSelected(account: any): boolean {
  const current: any[] = this.filter.accounts || [];
  return current.some(a => a.altAcctId === account.altAcctId);
}

toggleAccountMulti(account: any): void {
  const current: any[] = this.filter.accounts || [];
  const exists = current.findIndex(a => a.altAcctId === account.altAcctId);
  this.filter.accounts = exists > -1
    ? current.filter(a => a.altAcctId !== account.altAcctId)
    : [...current, account];
}

removeAccountMulti(account: any): void {
  this.filter.accounts = (this.filter.accounts || [])
    .filter(a => a.altAcctId !== account.altAcctId);
}



  /**
   *  1000000 -> 1 000 000
   * @param amount
   *
   * @returns
   */
  formatAmount(amount: number | string | null): string | null {
    if (amount == null) return null;
    const num = typeof amount === 'string' ? Number(amount.replaceAll(" ", "")) : amount;
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  amountChange(event: any, from: boolean) {
    if (from) {
      this.filter.fromAmount = event.target.value;
    } else {
      this.filter.toAmount = event.target.value;
    }


    this.console.log('filter',this.filter)
  }

  searchChange(event: any) {
    this.filter.searchText = event.target.value
  }

  private setStartOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private setEndOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  // private normalizeLocalTime(date: Date): Date {
  //   return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  // }
setValuesToFilter() {
  const isMulti = this.accountSelectMode === 'multi';

  this.data.setFilter({
    filterByCorporateCard: this.filter.filterByCorporateCard ?? false,
    searchText: this.filter.searchText ?? "",
    // single mode fields
    senderAccount: !isMulti && this.filter.account
      ? { account: this.filter.account.altAcctId, nameAcc: this.filter.account.accountTitle, ...this.filter.account }
      : null,
    // multi mode fields
    senderAccounts: isMulti && this.filter.accounts?.length
      ? this.filter.accounts.map(a => ({ account: a.altAcctId, nameAcc: a.accountTitle, ...a }))
      : null,
    type: this.filter.type?.length > 0 ? this.filter.type : 'ANY',
    statuses: this.filter.status ?? null,
    startDate: this.filter.from ?? null,
    endDate: this.filter.to ?? null,
    fromAmount: this.filter.fromAmount?.toString().length > 0
      ? Number(this.filter.fromAmount.toString().replaceAll(" ", ""))
      : null,
    toAmount: this.filter.toAmount?.toString().length > 0
      ? Number(this.filter.toAmount.toString().replaceAll(" ", ""))
      : null,
  });
  this._matDialogRef.close();
}
  isCurrencySelected(status: string): boolean {
    const selected: string[] = this.filter.status || [];
    return selected.includes(status);
  }

  setStatus(status: string) {
    const currentValues = this.filter.status || [];
    const index = currentValues.indexOf(status);

    let newValues: string[];
    if (index > -1) {
      newValues = currentValues.filter(v => v !== status);
    } else {
      newValues = [...currentValues, status];
    }

    this.filter.status = newValues.length > 0 ? newValues : null
  }

  resetValues() {
    this.data.setFilter({
      searchText: "",
      senderAccount: null,
      senderAccounts: null,
      type: 'ANY',
      statuses: null,
      startDate: null,
      endDate: null,
      fromAmount:  null,
      toAmount: null,
    });
    this.filter = {
      searchText: "",
      account: "",
      type: "ANY",
          accounts: [],
      status: "",
      from: null,
      to: null,
      fromAmount: "",
      toAmount: "",
    }
  }



removeFilter(key: keyof typeof this.filter): void {
  if (!this.filter.hasOwnProperty(key)) return;
  if (key === 'type') this.filter[key] = 'ANY';
  else if (key === 'searchText') this.filter[key] = '';
  else if (key === 'from' || key === 'to') this.filter[key] = null;
  else if (key === 'accounts') this.filter[key] = [];   // ← ADD
  else this.filter[key] = null;
}
  repeatPayment(transaction) {
    if (transaction.transactionMode === "TRANSACTION") {
      this.router.navigate(['/payment/transfer-to-account'], {
        queryParams: {
          transactionId: transaction.id,
          type: "repeat"
        }
      });
    } else if (transaction.transactionMode === "BUDGET") {
      this.router.navigate(['/payment/transfer-to-budget'], {
        queryParams: {
          transactionId: transaction.id,
          type: "repeat"
        }
      });
    } else if (transaction.transactionMode === "BUDGET_INCOME") {
      this.router.navigate(['/payment/transfer-to-treasure'], {
        queryParams: {
          transactionId: transaction.id,
          type: "repeat"
        }
      });
    } else {
      this.router.navigate(['/payment/transfer-to-card'], {
        queryParams: {
          transactionId: transaction.id,
          type: "repeat"
        }
      });
    }
  }

  setPeriodToday() {
    const today = new Date();
    const startDate = new Date(today.setHours(0, 0, 0, 0));
    const endDate = new Date(today.setHours(23, 59, 59, 999));

    this.filter.from = startDate;
    this.filter.to = endDate;
    this.selectedPeriod = "today"
    this._cdRef.detectChanges()
  }

  setPeriodYesterday() {
    const now = new Date();
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const startDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0, 0);
    const endDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59, 999);

    this.filter.from = startDate;
    this.filter.to = endDate;
    this.selectedPeriod = "yesterday"
    this._cdRef.detectChanges()
  }

  setPeriodWeek() {
    const now = new Date();
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 6);

    this.filter.from = startDate;
    this.filter.to = endDate;
    this.selectedPeriod = "week";
    this._cdRef.detectChanges();
  }

  setPeriodMonth() {
    const now = new Date();
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 29);

    this.filter.from = startDate;
    this.filter.to = endDate;
    this.selectedPeriod = "month";
    this._cdRef.detectChanges();
  }


  loading = false;

  onDateChange(event: any, from: boolean) {
    if (from) {
      this.filter.from = event.value;
    }else {
      this.filter.to = event.value;
    }
    this.selectedPeriod = null;
  }

  formatDate(createdAt: string): string {
    const [datePart, timePart] = createdAt.split(" ");
    const [day, month, year] = datePart.split(".");
    const [hour, minute] = timePart.split(":");

 const translateMonths = [
        'new.january',
        'new.february',
        'new.march',
        'new.april',
        'new.may',
        'new.june',
        'new.july',
        'new.august',
        'new.september',
        'new.october',
        'new.november',
        'new.december'
      ];

  const monthKey = translateMonths[parseInt(month, 10) - 1];
  const monthName = this.translateService.instant(monthKey);

  return `${parseInt(day, 10)} ${monthName} ${year}, ${hour}:${minute}`;
  }

  getActions() {
    if (this.data.buttons.length > 0) {
      return this.data.buttons.map(action => ({
        id: action.actionType,
        title: action.name,
      }));
    }
    return [];
  }
  onAction(action: string) {
    if (action !== 'sign') {
      console.log('Oddiy action bosildi:', action);
    }
  }
  constructor(
    private amountService: AmountService,
    private accountsPaymentsService: AccountsPaymentsService,
    private _matDialog: MatDialog,
    protected _matDialogRef: MatDialogRef<FilterModalComponent>,
    private destroyRef: DestroyRef,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,
    private toastrService: ToastrService,
    private _cdRef: ChangeDetectorRef,
  ) {
  }



  // saveTemplate(id: string) {
  //   if (id) {
  //     let dialog = this._matDialog.open(SaveTransactionComponent, {
  //       disableClose: true,
  //       width: '744px',
  //       maxWidth: '744px',
  //       data: id
  //     })
  //     dialog.componentInstance.save
  //       .pipe(takeUntilDestroyed(this.destroyRef))
  //       .subscribe(() => {
  //         dialog.close()
  //       })
  //   }
  // }

  // repeatPayment() {
  //   sessionStorage.setItem('repeat-payment', JSON.stringify(this.data));
  //   this._matDialogRef.close();
  //   if (this.data.transactionMode === 'DEPOSIT_WITHDRAW') {
  //     this.router.navigate(['/deposits/my-deposits/withdraw']);
  //   } else {
  //     this.router.navigate(['/pay'], {
  //       queryParams: {
  //         from: 'repeat-payment'
  //       }
  //     });
  //   }
  // }


  protected readonly Math = Math;
  protected readonly statusListToMap = statusListToMap;
  protected readonly console = console;
  protected readonly paymentMap = paymentMapNew;
}
