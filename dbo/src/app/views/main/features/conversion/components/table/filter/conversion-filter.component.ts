import {
  AfterViewInit,
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component, DestroyRef,
  EventEmitter, HostListener, input, Input, OnChanges,
  OnInit, output,
  Output, signal, SimpleChanges
} from '@angular/core';
import { NgClass, NgForOf, NgIf, NgOptimizedImage } from '@angular/common';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DateAdapter, provideNativeDateAdapter } from '@angular/material/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatChip, MatChipRemove } from '@angular/material/chips';

import { MatMenu, MatMenuTrigger } from "@angular/material/menu";
import { debounceTime, distinctUntilChanged, Subject, tap } from "rxjs";
import { MatDialog } from "@angular/material/dialog";
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  MatDatepickerActions, MatDatepickerApply, MatDatepickerCancel, MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker,
  MatEndDate,
  MatStartDate
} from "@angular/material/datepicker";
import {MatInput} from "@angular/material/input";
import { MatIconModule } from '@angular/material/icon';
import { DatePickerDefaultComponent } from 'src/app/shared/components/date-picker-default/date-picker-default.component';
import { SvgIconComponent } from 'src/app/shared/components/svg-icon/svg-icon.component';
import { CustomDateAdapter } from 'src/app/core/services/custom-date-adapter.service';
import { AccountsPaymentsService } from 'src/app/views/main/features/accounts-payments/services/accounts-payments.service';
import { AccountService } from 'src/app/core/services/account.service';
import { FilterModalComponent } from 'src/app/shared/components/filter-modal/filter-modal.component';
import { AccountsDto } from 'src/app/views/main/features/accounts-payments/models/accounts-payments.model';
import { paymentMapNew, statusesList, statusListToMap } from 'src/app/views/main/features/transaction-detail/model/transaction-detail.interface';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-conversion-filter',
  imports: [
    FormsModule,
    MatChip,
    MatChipRemove,
    NgOptimizedImage,
    ReactiveFormsModule,
    NgClass,
    MatMenu,
    MatMenuTrigger,
    NgForOf,
    NgIf,
    DatePickerDefaultComponent,
    TranslateModule,
    MatDateRangePicker,
    MatDateRangeInput,
    MatEndDate,
    MatStartDate,
    MatDatepickerActions,
    MatDatepickerApply,
    MatDatepickerCancel,
    MatInput,
    MatIconModule,
    SvgIconComponent
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: DateAdapter, useClass: CustomDateAdapter },
  ],
  styles: [
    `
      ::ng-deep .mat-calendar-body-selected {
        background-color: #00A38D !important;
      }

    `
  ],
  templateUrl: './conversion-filter.component.html',
  standalone:true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConversionFilterComponent implements OnInit, OnChanges  {
  @Output() filterChange = new EventEmitter<any>();
  @Output() searched = new EventEmitter();
  @Input() panelState = false;
  @Input() toggleActive = false;
  @Input() isActivePage: 'history' | 'main' = 'main';
  @Input() isActionStatus = false;
  @Input() activeTabs = ''
  @Input() isCalendarRange = false;
  @Input() activeMainTabs = '';
  @Input() hasDownloadButton =false
  @Input() showDownloadAllErrors = false
  @Output() downloadAllErrors = new EventEmitter<any>()
  inputSubject = new Subject<any>();
  // corpAccount = signal<any>(null)
  private suppressEmit = false;

  currencies: any[] = [];
  accounts: any[] = [];
  backAction = output<string>()
  payments = [];
  yesterday = new Date();
  showAmountChip = false;

  paymentTypes = [
    { title: 'Все платежи', value: null },
    { title: 'accountStatements.counterparty', value: 'TRANSACTION' },
    // { title: 'SWIFT', value: 'SWIFT' },
    { title: 'Бюджет', value: 'BUDGET' },
    { title: 'Бюджет-доход', value: 'BUDGET_INCOME' },
    // { title: 'Мунис', value: 'P2SERVICE' },
    // { title: 'Зарплата', value: 'SALARY' },
    { title: 'Корпоратив карта', value: 'CARD' },
    // { title: 'Снятие средств с депозита', value: 'DEPOSIT_WITHDRAW' },
    // { title: 'Погашение кредита', value: 'LOAN_REPAYMENT' },
  ];


  filterForm = this.fb.group({
    startDate: new FormControl<any | null>(null),
    endDate: new FormControl<any | null>(null),
    type: new FormControl<string>('ANY'),
    docNum: new FormControl<string | null>(null),
    searchText: new FormControl<string>(''),
    senderAccount: new FormControl<any | null>(null),
    receiverAccount: new FormControl<string | null>(null),
    inn: new FormControl<string | null>(null),
    receiverName: new FormControl<string | null>(null),
    fromAmount: new FormControl<number | null>(null),
    toAmount: new FormControl<number | null>(null),
    currency: new FormControl<number | null>(null),
    statuses: new FormControl<string[] | null>(null),
    transactionModes: [null],
    transactionStepFilter: new FormControl<string | null>(null),
    rangeForm: [null],
  });

  massPaymentTableFilterStatusListToMap:any[] = []
  SVG_URL = environment.SVG_URL
  constructor(
    private fb: FormBuilder,
    private accountsPaymentsService: AccountsPaymentsService,
    private accountService: AccountService,
    private destroyRef: DestroyRef,
    private _cdRef: ChangeDetectorRef,
    private _matDialog: MatDialog,
    private translateService:TranslateService
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isActionStatus']) {
      this._cdRef.markForCheck();
    }
    if (changes['activeTabs']) {
      this.clearAllFilters()
    }
  }

  ngOnInit() {
    this.accountsPaymentsService.getTransactionStatusList().subscribe((res:any) => {
      this.massPaymentTableFilterStatusListToMap = this.transformApiStatusesToLocalFormat(res)
    })

    // this.getCurrencies();
    this.getAccountsV2();
    this.setYesterDay();
    // this.getAccountsList();
    // this.filterChange.emit(this.removeRangeFormFromForm(this.filterForm.value));
    // this.filter();

    this.inputSubject
      .pipe(debounceTime(800), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((val) => {
        this.filterForm.patchValue({
          searchText: val.target.value
        })
        this.search();
      });

    if (this.isCalendarRange) {
      this.handleStartAndEndDate()
    }

  }

  handleApply() {
    this.search()
    this.showAmountChip = true;
  }

  handleReset() {
    this.filterForm.patchValue({
      fromAmount: null,
      toAmount: null,
    });
    this.search()
  }

  private removeRangeFormFromForm(obj: any) {
    let copiedFilterFormValue = JSON.parse(JSON.stringify(obj))
    if (copiedFilterFormValue.hasOwnProperty('rangeForm')) {
      delete copiedFilterFormValue['rangeForm']
    }

    return copiedFilterFormValue
  }

  private handleStartAndEndDate() {
    this.filterForm?.get('rangeForm')?.valueChanges.pipe(
      debounceTime(1000),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
      tap((res: any) => {
        this.filterForm.get('startDate')?.setValue(res.start)
        this.filterForm.get('endDate')?.setValue(res.end)
        this.search()
      })
    ).subscribe()
  }

  onApply() {
    this.search();
  }

  // getAccountsList() {
  //   this.accountService.getAccountList({ page: 0, size: 100 }, {
  //     senderAccount: null,
  //     transactionMode: 'CORP_CARD_TOP_UP'
  //   }).subscribe(res => {
  //     if (!res) return;
  //     this.corpAccount.set(res)
  //   })
  // }

  setYesterDay() {
    // this.yesterday.setDate(this.yesterday.getDate() - 1);
    // this.filterForm.patchValue({
    //   startDate: this.yesterday
    // })
  }

  getAccountsV2() {
    this.accountService.getAccountList({ size: 100, page: 0 }, {}).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: AccountsDto[] | any) => {
          if (res) {
            this.accounts = res.content;
            this._cdRef.markForCheck();
          }
        }
      })
    // setTimeout(() => console.log(this.accounts, "acc"), 2000)
  }


  get transactionModes() {
    return this.filterForm.get('transactionModes');
  }

  clearFilter() {
    this.filterForm.reset();
    this.filterForm.patchValue({
      type: 'ANY',
      searchText: '',
    })
    this.filterChange.emit(this.removeRangeFormFromForm(this.filterForm.value));
  }

  setType(value: string) {
    this.filterForm.patchValue({
      type: value,
    });
    this.filter();
  }

  search() {
    this.filter();
    this.searched.emit();
  }

  filter() {
    const filterBody: any = this.filterForm.getRawValue();
    filterBody.statuses = filterBody.statuses ? filterBody.statuses : null;
    filterBody.transactionModes = filterBody.transactionModes ? [filterBody.transactionModes] : null;
    filterBody.fromAmount =
      filterBody.fromAmount !== null && filterBody.fromAmount !== undefined
        ? filterBody.fromAmount * 100
        : null;


    if (filterBody.type  == 'CREDIT') {
      filterBody.receiverAccount = filterBody.senderAccount ? filterBody.senderAccount.account : null;
      filterBody.senderAccount = null;
    } else if (filterBody.type  == 'DEBIT') {
      filterBody.senderAccount = filterBody.senderAccount ? filterBody.senderAccount.account : null;
      filterBody.receiverAccount = null;
    } else {
      filterBody.receiverAccount = filterBody.senderAccount ? filterBody.senderAccount.account : null;
      filterBody.senderAccount = filterBody.senderAccount ? filterBody.senderAccount.account : null;
    }
    filterBody.toAmount = filterBody.toAmount !== null && filterBody.toAmount !== undefined ? filterBody.toAmount * 100: null;

    filterBody.startDate = filterBody.startDate ? filterBody.startDate : null;
    filterBody.endDate = filterBody.endDate ? filterBody.endDate : null;
    this.filterChange.emit(this.removeRangeFormFromForm(filterBody));
  }

  //
  // getCurrencies() {
  //   this.accountsPaymentsService.getCurrencies()
  //     .pipe(takeUntilDestroyed(this.destroyRef))
  //     .subscribe({
  //       next: (res) => {
  //         if(res) {
  //           this.currencies = res;
  //           this._cdRef.markForCheck();
  //         }
  //       }
  //     })
  // }

  getAccounts(searchText: any) {
    this.accountService.getAccountList({ size: 100, page: 0 }, { searchText })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res) {
            this.accounts = res.content.map(el => el.altAcctId);
            this._cdRef.markForCheck();
          }
        }
      })
  }

  getActiveFilters(): { key: string; value: any }[] {
    const filters = this.filterForm.value;
    const activeFilters: { key: string; value: any }[] = [];

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== '' && value !== 'ANY') {
        activeFilters.push({ key, value });
      }
    });
    return activeFilters;
  }

  // getActiveFilter(key: string): { key: string; value: any } | null {
  //   return this.activeFilters.find(f => f.key === key) || null;
  // }

  removeFilter(key: string): void {
    const control = this.filterForm.get(key);
    if (control) {
      const isType = key === 'type';
      const isSearchText = key === 'searchText';
      control.reset(isType ? 'ANY' : isSearchText ? '' : null);
      this.search();
    }
  }
  clearAllFilters(): void {
    Object.keys(this.filterForm.controls).forEach(key => {
      const control = this.filterForm.get(key);
      if (control) {
        const isType = key === 'type';
        const isSearchText = key === 'searchText';
        control.reset(isType ? 'ANY' : isSearchText ? '' : null);
      }
    });

    this.search();
  }

  hasAnyFilter(): boolean {
    const value = this.filterForm.value;

    return Object.keys(value).some(key => {
      const val = value[key];

      if (key === 'type' && val === 'ANY') {
        return false;
      }
      if (key === 'searchText' && !val) {
        return false;
      }
      return val !== null && val !== undefined && val !== '';
    });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      // this.openChooseList();
      this.search();
    }
  }

  setPeriodToday() {
    const today = new Date();
    const startDate = new Date(today.setHours(0, 0, 0, 0));
    const endDate = new Date(today.setHours(23, 59, 59, 999));
    return this.setFilter({ startDate, endDate }, "period")
  }

  setPeriodYesterday() {
    const now = new Date();
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const startDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0, 0);
    const endDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59, 999);

    return this.setFilter({ startDate, endDate }, "period")
  }

  setPeriodWeek() {
    const now = new Date();
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 6);

    return this.setFilter({ startDate, endDate }, "period");
  }

  setPeriodMonth() {
    const now = new Date();
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 29);

    return this.setFilter({ startDate, endDate }, "period");
  }

  setFilterFromPopUp(filters: any) {
    this.filterForm.patchValue(filters)
    this.search();
  }

  isCurrencySelected(status: string): boolean {
    const selected: string[] = this.filterForm.value.statuses || [];
    return selected.includes(status);
  }

  setFilter(value: any, type: string) {
    if (type === "account") {
      this.filterForm.patchValue({
        senderAccount: { account: value.altAcctId, nameAcc: value.accountTitle, ...value }
      })
      this.search();
    } else if (type === "type") {
      this.filterForm.patchValue({
        type: value
      })
      this.search();
    } else if (type === "status") {
      const currentValues = this.filterForm.value.statuses || [];
      const index = currentValues.indexOf(value);

      let newValues: string[];
      if (index > -1) {
        newValues = currentValues.filter(v => v !== value);
      } else {
        newValues = [...currentValues, value];
      }

      this.filterForm.patchValue({
        statuses: newValues.length > 0 ? newValues : null
      })

      this.search();
    } else if (type === "period") {
      this.filterForm.patchValue({
        startDate: value.startDate,
        endDate: value.endDate,
      })
      this.search();
    }
  }

  formatFilter(key: string, value: any): string {
    let val = value;

    const keyMap: { [key: string]: string } = {
      startDate: 'От',
      endDate: 'До',
      type: this.translateService.instant('cardFileTwo.type'),
      docNum: 'Документ №',
      searchText: this.translateService.instant('accounts.search'),
      senderAccount: 'Счёт отправителя',
      receiverAccount: this.translateService.instant('createPayment.recipient_account'),
      inn: this.translateService.instant('createPayment.inn'),
      receiverName: this.translateService.instant('createPayment.recipient'),
      fromAmount: 'Cумма от',
      toAmount: 'Сумма до',
      currency: this.translateService.instant('main.currency'),
      statuses: this.translateService.instant('main.status'),
      transactionModes: this.translateService.instant('main.transaction_type'),
      transactionStepFilter: 'Статус действия'
    };

    if (key === 'transactionModes') {
      const type = this.paymentTypes.find(t => t.value === value);
      val = type ? type.title : value;
    }

    // Map statuses to Russian
    if (key === 'statuses') {
      if (Array.isArray(value)) {
        val = value.map(v => this.paymentMap[v] || v).join(', ');
      } else {
        val = this.paymentMap[value] || value;
      }
    }

    // Map transactionStepFilter to Russian
    if (key === 'transactionStepFilter') {
      const actionStepMap: Record<string, string> = {
        ALL: this.translateService.instant('story.all'),
        WORKING: 'В работе',
        SIGN: this.translateService.instant('accounts.pending_signature'),
        CHANGE: this.translateService.instant('story.needs_revision')
      };
      val = actionStepMap[value] || value;
    }

    if (key === 'startDate' || key === 'endDate') {
      val = new Date(value).toLocaleDateString('ru-RU');
    }

    return `${keyMap[key] || key}: ${val}`;
  }

  detectPeriodLabel(startDate: Date, endDate: Date): string {
    const now = new Date();

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0);
    const yesterdayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);

    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0);
    const weekEnd = todayEnd;

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const format = (d: Date) =>
      d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });

    if (startDate.getTime() === todayStart.getTime() && endDate.getTime() === todayEnd.getTime()) {
      return `${this.translateService.instant('story.today')} ${format(startDate)}`;
    }

    if (startDate.getTime() === yesterdayStart.getTime() && endDate.getTime() === yesterdayEnd.getTime()) {
      return `${this.translateService.instant('story.yesterday')} ${format(startDate)}`;
    }

    if (startDate.getTime() === weekStart.getTime() && endDate.getTime() === weekEnd.getTime()) {
      return `${format(weekStart)} – ${format(weekEnd)}`;
    }

    if (startDate.getTime() === monthStart.getTime() && endDate.getTime() === monthEnd.getTime()) {
      return `${format(monthStart)} – ${format(monthEnd)}`;
    }

    return `${format(startDate)} – ${format(endDate)}`;
  }


  transformApiStatusesToLocalFormat(apiStatuses: Array<{code: string, title: string, logo: string}>) {
    return apiStatuses.map(apiStatus => {
      const localMatch = statusListToMap.find(
        local => local.value === apiStatus.code
      );

      return {
        name: apiStatus.title,
        value: apiStatus.code,
        img: apiStatus.logo,
        nameKey: localMatch?.nameKey || apiStatus.title
      };
    });
  }

  protected readonly statusesList = statusesList;
  protected readonly paymentMap = paymentMapNew;
  protected readonly statusListToMap = statusListToMap;
  protected readonly console = console;
}
