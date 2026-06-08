import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component, DestroyRef,
  EventEmitter, HostListener, input, Input, OnChanges,
  OnInit, output,
  Output, signal, SimpleChanges,
  ViewChild
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
import { MatIconModule } from '@angular/material/icon';
import {ToastrService} from "ngx-toastr";
import {
  DatePickerDefaultComponent
} from "../../../../../../../../shared/components/date-picker-default/date-picker-default.component";
import {SvgIconComponent} from "../../../../../../../../shared/components/svg-icon/svg-icon.component";
import {AccountService} from "../../../../../../../../core/services/account.service";
import {PaymentService} from "../../../../../../../../core/services/payment.service";
import {FilterModalComponent} from "../../../../../../../../shared/components/filter-modal/filter-modal.component";
import {paymentMapNew, statusesList, statusListToMap} from "../../../../../transaction-detail/model/transaction-detail.interface";
import {CustomDateAdapter} from "../../../../../../../../core/services/custom-date-adapter.service";
import {InputSize} from "../../../../../../../../shared/components/input-default/input-default.component";
import {AccountsDto} from "../../../../../accounts-payments/models/accounts-payments.model";

@Component({
  selector: 'app-deposit-payment-filter',
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
    MatIconModule,
    SvgIconComponent,
    DatePickerDefaultComponent,
  ],
  providers: [
    provideNativeDateAdapter(),
    {provide: DateAdapter, useClass: CustomDateAdapter},
  ],
  styles: [
    `
      ::ng-deep .mat-calendar-body-selected {
        background-color: #00A38D !important;
      }

    `
  ],
  styleUrls:['./deposit-payment-filter.component.scss'],
  templateUrl: './deposit-payment-filter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositPaymentFilterComponent  implements OnInit, OnChanges  {
  @Output() filterChange = new EventEmitter<any>();
  @Output() searched = new EventEmitter();
  @Input() panelState = false;
  @Input() toggleActive = false;
  @Input() isActivePage: 'history' | 'main' = 'main';
  @Input() isActionStatus = false;
  @Input() activeTabs = ''
  @Input() isCalendarRange = false;
  @Input() activeMainTabs = '';
  @Input() accountSelectMode: 'single' | 'multi' = 'single';
  hasFilter = output<boolean>()


  calendarInputSize = input<InputSize>('small')
  @ViewChild('customPicker') customPicker!: DatePickerDefaultComponent;



  inputSubject = new Subject<any>();
  // corpAccount = signal<any>(null)
  private suppressEmit = false;

  currencies: any[] = [];
  accounts: any[] = [];
  backAction = output<string>()
  payments = [];
  yesterday = new Date();

  statuses = signal<any>([]);

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
    filterByCorporateCard: new FormControl<boolean>(false),
    currency: new FormControl<number | null>(null),
    statuses: new FormControl<any[] | null>(null),
    transactionModes: [null],
    transactionStepFilter: new FormControl<string | null>(null),
    rangeForm: [null],
    senderAccounts: new FormControl<any[] | null>(null),
    receiverAccounts: new FormControl<any[] | null>(null),
  });

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private paymentService: PaymentService,
    private destroyRef: DestroyRef,
    private _cdRef: ChangeDetectorRef,
    private _matDialog: MatDialog,
    private translateService:TranslateService,
    private toast: ToastrService
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isActionStatus']) {
      this._cdRef.markForCheck();
    }
    if (changes['activeTabs'] && this.isActivePage === 'history') {
      this.clearAllFilters()
    }

    if (changes['activeMainTabs'] && this.isActivePage === 'main') {
      this.clearAllFilters()
    }
  }

  ngOnInit() {
    this.getStatuses();
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

    // if (this.isCalendarRange) {
    this.handleStartAndEndDate()
    // }

  }

  get selectedAccounts(): any[] {
    return this.filterForm.value.senderAccounts || [];
  }

  get selectedStatuses(): any[] {
    return this.filterForm.value.statuses || [];
  }

  get showAccountBadge(): boolean {
    return this.selectedAccounts.length >= 3;
  }

  get showStatusBadge(): boolean {
    return this.selectedStatuses.length >= 3;
  }

  stopPropagation(event:Event){
    event.stopPropagation()
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

  private getStatuses() {
    this.paymentService.getStatusMain().pipe().subscribe({
      next: data => {
        this.statuses.set(data)
      },
      error: err => {
        this.toast.error(err.message)
      }
    })
  }

  showFilterModal() {
    const dialog = this._matDialog.open(FilterModalComponent, {
      width: '550px',
      height: '100%',
      position: { right: '0' },
      panelClass: 'right-side-dialog',
      disableClose: true,
      data: {
        statuses: this.statuses(),
        account: this.accounts,
        setFilter: (value: any) => this.setFilterFromPopUp(value),
        filterForm: this.filterForm.value,
        activeTabs: this.activeTabs,
        activeMainTabs: this.activeMainTabs,
        accountSelectMode: this.accountSelectMode,
      }
    });
    dialog.componentInstance.onDetail.subscribe(res => {
      this.backAction.emit(res)
      dialog.close()
    })
  }

  openCustomPicker() {
    this.customPicker.open();
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
    this.filterForm.patchValue({ senderAccounts: null });
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

  // filter() {
  //   const filterBody: any = this.filterForm.getRawValue();
  //   filterBody.statuses = filterBody.statuses ? filterBody.statuses : null;
  //   filterBody.transactionModes = filterBody.transactionModes ? [filterBody.transactionModes] : null;
  //   filterBody.fromAmount = filterBody.fromAmount * 100;
  //   if (filterBody.type  == 'CREDIT') {
  //     filterBody.receiverAccount = filterBody.senderAccount ? filterBody.senderAccount.account : null;
  //     filterBody.senderAccount = null;
  //   } else if (filterBody.type  == 'DEBIT') {
  //     filterBody.senderAccount = filterBody.senderAccount ? filterBody.senderAccount.account : null;
  //     filterBody.receiverAccount = null;
  //   } else {
  //     filterBody.receiverAccount = filterBody.senderAccount ? filterBody.senderAccount.account : null;
  //     filterBody.senderAccount = filterBody.senderAccount ? filterBody.senderAccount.account : null;
  //   }
  //   filterBody.toAmount = filterBody.toAmount ? filterBody.toAmount * 100 : null;
  //   filterBody.startDate = filterBody.startDate ? filterBody.startDate : null;
  //   filterBody.endDate = filterBody.endDate ? filterBody.endDate : null;
  //   this.filterChange.emit(this.removeRangeFormFromForm(filterBody));
  // }

  toggleAccountMulti(account: any): void {
    const current: any[] = this.filterForm.value.senderAccounts || [];
    const exists = current.findIndex(a => a.account === account.altAcctId);
    const newList = exists > -1
      ? current.filter(a => a.account !== account.altAcctId)
      : [...current, { account: account.altAcctId, nameAcc: account.accountTitle, ...account }];

    this.filterForm.patchValue({ senderAccounts: newList.length ? newList : null });
    this.search();
  }

  isAccountSelected(account: any): boolean {
    const current: any[] = this.filterForm.value.senderAccounts || [];
    return current.some(a => a.account === account.altAcctId);
  }

  get isCorporateCard() {
    return this.filterForm.get('filterByCorporateCard')?.value;
  }

  filter() {
    const filterBody: any = this.filterForm.getRawValue();
    filterBody.statuses = filterBody.statuses ? filterBody.statuses : null;
    filterBody.transactionModes = filterBody.transactionModes ? [filterBody.transactionModes] : null;
    filterBody.fromAmount = filterBody.fromAmount * 100;
    filterBody.toAmount = filterBody.toAmount ? filterBody.toAmount * 100 : null;

    if (this.accountSelectMode === 'multi') {
      const accounts: any[] = filterBody.senderAccounts || [];
      const accountStrings = accounts.map(a => a.account);

      if (filterBody.type === 'CREDIT') {
        filterBody.receiverAccounts = accountStrings.length ? accountStrings : null;
        filterBody.senderAccounts = null;
      } else if (filterBody.type === 'DEBIT') {
        filterBody.senderAccounts = accountStrings.length ? accountStrings : null;
        filterBody.receiverAccounts = null;
      } else {
        filterBody.senderAccounts = accountStrings.length ? accountStrings : null;
        filterBody.receiverAccounts = accountStrings.length ? accountStrings : null;
      }
      filterBody.senderAccount = null;
      filterBody.receiverAccount = null;
    } else {
      if (filterBody.type === 'CREDIT') {
        filterBody.receiverAccount = filterBody.senderAccount?.account ?? null;
        filterBody.senderAccount = null;
      } else if (filterBody.type === 'DEBIT') {
        filterBody.senderAccount = filterBody.senderAccount?.account ?? null;
        filterBody.receiverAccount = null;
      } else {
        filterBody.receiverAccount = filterBody.senderAccount?.account ?? null;
        filterBody.senderAccount = filterBody.senderAccount?.account ?? null;
      }
      filterBody.senderAccounts = null;
      filterBody.receiverAccounts = null;
    }

    filterBody.startDate = filterBody.startDate ?? null;
    filterBody.endDate = filterBody.endDate ?? null;
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
      const isRangeForm = key === 'rangeForm';
      control.reset(
        isType ? 'ANY' :
          isSearchText ? '' :
            isRangeForm ? { start: null, end: null } :
              null
      );
      this.search();
    }
  }

  clearAllFilters(): void {
    Object.keys(this.filterForm.controls).forEach(key => {
      const control = this.filterForm.get(key);
      if (control) {
        const isType = key === 'type';
        const isSearchText = key === 'searchText';
        const isRangeForm = key === 'rangeForm';
        control.reset(
          isType ? 'ANY' :
            isSearchText ? '' :
              isRangeForm ? { start: null, end: null } :
                null
        );
      }
    });
    this.filterForm.patchValue({ senderAccounts: null });


    this.search();
  }


  hasAnyFilter(): boolean {
    const value = this.filterForm.value;
    let result =  Object.keys(value).some(key => {
      const val = value[key];
      if (key === 'rangeForm') return false;
      if (key === 'type' && val === 'ANY') return false;
      if (key === 'searchText' && !val) return false;
      if (key === 'senderAccounts' && (!val || !val.length)) return false;
      if (typeof val === 'boolean') return val;
      return val !== null && val !== undefined && val !== '';
    });

    this.hasFilter.emit(result)
    return result;
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

  protected readonly statusesList = statusesList;
  protected readonly paymentMap = paymentMapNew;
  protected readonly statusListToMap = statusListToMap;
  protected readonly console = console;
}
