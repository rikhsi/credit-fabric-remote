import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { NgOptimizedImage, NgTemplateOutlet } from '@angular/common';
import { FilterButtonComponent } from '../common/filter-button/filter-button.component';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatChip, MatChipRemove, MatChipSet } from '@angular/material/chips';
import { MatAccordion, MatExpansionPanel } from '@angular/material/expansion';
import { AccountSelectComponent } from '../account-select/account-select.component';
import { MatFormField, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { AccountService } from '../../../core/services/account.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AccountsDto } from '../../../views/main/features/accounts-payments/models/accounts-payments.model';
import { MatLabel, MatOption, MatSelect } from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
  MatDatepickerToggleIcon
} from '@angular/material/datepicker';
import { NgxMaskDirective } from 'ngx-mask';
import { DateAdapter, provideNativeDateAdapter } from '@angular/material/core';
import {
  AccountsPaymentsService
} from '../../../views/main/features/accounts-payments/services/accounts-payments.service';
import { CustomDateAdapter } from '../../../core/services/custom-date-adapter.service';

@Component({
    selector: 'app-swift-filter',
    imports: [
        NgTemplateOutlet,
        FilterButtonComponent,
        ReactiveFormsModule,
        MatChip,
        MatChipRemove,
        MatChipSet,
        NgOptimizedImage,
        MatAccordion,
        MatExpansionPanel,
        AccountSelectComponent,
        MatFormField,
        MatInput,
        MatLabel,
        MatIcon,
        MatSuffix,
        MatDatepicker,
        MatDatepickerInput,
        MatDatepickerToggle,
        MatDatepickerToggleIcon,
        NgxMaskDirective,
        MatSelect,
        MatOption,
    ],
    providers: [
        provideNativeDateAdapter(),
        { provide: DateAdapter, useClass: CustomDateAdapter },
    ],
    templateUrl: './swift-filter.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwiftFilterComponent implements OnInit {
  @Input() panelState = false;
  @Input() toggleActive = false;
  accounts: AccountsDto[] = [];
  @Output() filterChange = new EventEmitter();
  currencies: any[] = [];
  yesterday = new Date();

  constructor(
    private fb: FormBuilder,
    private accountsService: AccountService,
    private destroyRef: DestroyRef,
    private accountsPaymentsService: AccountsPaymentsService,
    private _cdRef: ChangeDetectorRef,
  ) {
  }

  ngOnInit() {
    this.getAccounts();
    this.getCurrencies();
    this.search();
  }

  filterForm = this.fb.group({
    sender: new FormControl<string | null>(null),
    receiver: new FormControl<string | null>(null),
    dateFrom: new FormControl<any | null>(null),
    dateTo: new FormControl<string | null>(null),
    amountFrom: new FormControl<string | null>(null),
    amountTo: new FormControl<string | null>(null),
    docNum: new FormControl<string | null>(null),
    currency: new FormControl<string | null>(null),
    searchText: new FormControl<string>(''),
  });

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

  search() {
    const amountFrom = this.filterForm.value.amountFrom;
    const amountTo = this.filterForm.value.amountFrom;
    const body = this.filterForm.getRawValue();
    if(amountFrom) {
      body.amountFrom = `${+amountFrom * 100}`;
    }
    if(amountTo) {
      body.amountTo = `${+amountTo * 100}`;
    }
    this.filterChange.emit(body);
  }

  clearFilter() {
    this.filterForm.reset();
    this.filterForm.patchValue({
      searchText: '',
    });
  }

  getAccounts() {
    this.accountsService.getPaymentAllowed(
      {page: 0, size: 100},
      {
        senderAccount: null,
        transactionMode: 'SWIFT'
      }
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if(res) {
            this.accounts = res.content;
          }
        }
      })
  }

  setFormFields(acc: AccountsDto) {
    this.filterForm.patchValue({
      sender: acc.altAcctId,
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
    }
  }

  formatFilter(key: string, value: any): string {
    let val = value;
    const keyMap: { [key: string]: string } = {
      dateFrom: 'От',
      dateTo: 'До',
      type: 'Тип',
      docNum: 'Документ №',
      searchText: 'Поиск',
      sender: 'Счёт отправителя',
      receiverAccount: 'Счёт получателя',
      inn: 'ИНН',
      receiverName: 'Получатель',
      amountFrom: 'Cумма от',
      amountTo: 'Сумма до',
      currency: 'Валюта',
      statuses: 'Статус',
      transactionModes: 'Тип транзакции',
    };

    if (key === 'dateFrom' || key === 'dateTo') {
      val = new Date(value).toLocaleDateString('ru-Ru');
    }

    return `${keyMap[key] || key}: ${val}`;
  }
}
