import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  EventEmitter,
  Input, OnInit,
  Output
} from '@angular/core';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccountsPaymentsService } from '../../../accounts-payments/services/accounts-payments.service';
import { AccountService } from '../../../../../../core/services/account.service';
import { DateAdapter, MatOption, provideNativeDateAdapter } from '@angular/material/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FilterButtonComponent
} from '../../../../../../shared/components/common/filter-button/filter-button.component';
import { MatAccordion, MatExpansionPanel } from '@angular/material/expansion';
import { MatChip, MatChipRemove, MatChipSet } from '@angular/material/chips';
import {
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker,
  MatEndDate,
  MatStartDate
} from '@angular/material/datepicker';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { NgClass, NgOptimizedImage, NgTemplateOutlet } from '@angular/common';
import { CustomDateAdapter } from '../../../../../../core/services/custom-date-adapter.service';

@Component({
    selector: 'app-filter-template',
    imports: [
        FilterButtonComponent,
        FormsModule,
        MatAccordion,
        MatChip,
        MatChipRemove,
        MatChipSet,
        MatDateRangeInput,
        MatDateRangePicker,
        MatDatepickerToggle,
        MatEndDate,
        MatExpansionPanel,
        MatFormField,
        MatIcon,
        MatInput,
        MatLabel,
        MatOption,
        MatSelect,
        MatStartDate,
        MatSuffix,
        NgOptimizedImage,
        NgTemplateOutlet,
        ReactiveFormsModule,
        NgClass
    ],
    templateUrl: './filter-template.component.html',
    styles: ``,
    providers: [
        provideNativeDateAdapter(),
        { provide: DateAdapter, useClass: CustomDateAdapter },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterTemplateComponent implements OnInit {
  @Output() filterChange = new EventEmitter<any>();
  @Output() searched = new EventEmitter();

  @Input() panelState = false;
  @Input() toggleActive = false;

  currencies: any[] = [];
  accounts: any[] = [];

  payments = [];
  yesterday = new Date();

  paymentTypes = [
    { title: 'Все платежи', value: null },
    { title: 'Платежи', value: 'TRANSACTION' },
    { title: 'SWIFT', value: 'SWIFT' },
    { title: 'Бюджет', value: 'BUDGET' },
    { title: 'Зарплата', value: 'SALARY' },
    { title: 'Корпоратив карта', value: 'CARD' },
    { title: 'Снятие средств с депозита', value: 'DEPOSIT_WITHDRAW' },
    { title: 'Погашение кредита', value: 'LOAN_REPAYMENT' },
  ];


  filterForm = this.fb.group({
    startDate: new FormControl<any | null>(null),
    endDate: new FormControl<string | null>(null),
    type: new FormControl<string>('ANY'),
    docNum: new FormControl<string | null>(null),
    searchText: new FormControl<string>(''),
    senderAccount: new FormControl<string | null>(null),
    receiverAccount: new FormControl<string | null>(null),
    inn: new FormControl<string | null>(null),
    receiverName: new FormControl<string | null>(null),
    fromAmount: new FormControl<number | null>(null),
    toAmount: new FormControl<number | null>(null),
    currency: new FormControl<number | null>(null),
    statuses: [null],
    transactionModes: [null],
  });

  constructor(
    private fb: FormBuilder,
    private accountsPaymentsService: AccountsPaymentsService,
    private accountService: AccountService,
    private destroyRef: DestroyRef,
    private _cdRef: ChangeDetectorRef,
  ) {
  }

  ngOnInit() {
    // this.getCurrencies();
    this.setYesterDay();
    this.filterChange.emit(this.filterForm.value);
  }

  setYesterDay() {
    // this.yesterday.setDate(this.yesterday.getDate() - 1);
    // this.filterForm.patchValue({
    //   startDate: this.yesterday
    // })
  }



  get transactionModes () {
    return this.filterForm.get('transactionModes');
  }

  clearFilter() {
    this.filterForm.reset();
    this.filterForm.patchValue({
      type: 'ANY',
      searchText: '',
    })
    this.filterChange.emit(this.filterForm.value);
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
    filterBody.transactionModes = filterBody.transactionModes ? [filterBody.transactionModes] : null;
    filterBody.fromAmount = filterBody.fromAmount * 100;
    filterBody.toAmount = filterBody.toAmount ? filterBody.toAmount * 100 : null;
    filterBody.transactionModes = filterBody.transactionModes ? filterBody.transactionModes : null;
    this.filterChange.emit(filterBody);
  }

  getCurrencies() {
    this.accountsPaymentsService.getCurrencies()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if(res) {
            this.currencies = res;
            this._cdRef.markForCheck();
          }
        }
      })
  }

  getAccounts(searchText: any) {
    this.accountService.getAccountList({ size: 100, page: 0 } , { searchText })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if(res) {
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

  removeFilter(key: string): void {
    const control = this.filterForm.get(key);
    if (control) {
      const isType = key === 'type';
      const isSearchText = key === 'searchText';
      control.reset( isType ? 'ANY' : isSearchText ? '' : null);
      this.search();
    }
  }

  formatFilter(key: string, value: any): string {
    let val = value;
    const keyMap: { [key: string]: string } = {
      startDate: 'От',
      endDate: 'До',
      type: 'Тип',
      docNum: 'Документ №',
      searchText: 'Поиск',
      senderAccount: 'Счёт отправителя',
      receiverAccount: 'Счёт получателя',
      inn: 'ИНН',
      receiverName: 'Получатель',
      fromAmount: 'Cумма от',
      toAmount: 'Сумма до',
      currency: 'Валюта',
      statuses: 'Статус',
      transactionModes: 'Тип транзакции',
    };

    if (key === 'startDate' || key === 'endDate') {
      val = new Date(value).toLocaleDateString('ru-Ru');
    }

    return `${keyMap[key] || key}: ${val}`;
  }

}
