import {
  AfterContentInit,
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component, DestroyRef,
  EventEmitter, Input,
  OnInit,
  Output
} from '@angular/core';
import { NgClass, NgOptimizedImage, NgTemplateOutlet } from '@angular/common';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { MatError, MatFormField, MatInput, MatLabel, MatSuffix } from '@angular/material/input';
import { MatAccordion, MatExpansionPanel } from '@angular/material/expansion';
import { MatOption, MatSelect } from '@angular/material/select';
import {
  MatDatepicker,
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker,
  MatEndDate,
  MatStartDate
} from '@angular/material/datepicker';
import { DateAdapter, provideNativeDateAdapter } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatChipsModule } from '@angular/material/chips';
import { SelectComponent } from '../../../../../../shared/components/select/select.component';
import {
  FilterButtonComponent
} from '../../../../../../shared/components/common/filter-button/filter-button.component';
import {
  SearchableSelectComponent
} from '../../../../../../shared/components/searchable-select/searchable-select.component';
import { SearchableComponent } from '../../../../../../core/components/searchable/searchable.component';
import { AccountsPaymentsService } from '../../../accounts-payments/services/accounts-payments.service';
import { AccountService } from '../../../../../../core/services/account.service';
import { CustomDateAdapter } from '../../../../../../core/services/custom-date-adapter.service';

@Component({
    selector: 'app-filter-account',
    imports: [
        NgOptimizedImage,
        SelectComponent,
        FormsModule,
        ReactiveFormsModule,
        NgClass,
        MatInput,
        MatFormField,
        MatLabel,
        MatAccordion,
        MatExpansionPanel,
        FilterButtonComponent,
        MatSelect,
        MatDateRangeInput,
        MatDatepickerToggle,
        MatDateRangePicker,
        MatEndDate,
        MatError,
        MatStartDate,
        MatSuffix,
        MatDatepicker,
        MatOption,
        MatIcon,
        MatChipsModule,
        SearchableSelectComponent,
        SearchableComponent,
        NgTemplateOutlet,
    ],
    providers: [
        provideNativeDateAdapter(),
        { provide: DateAdapter, useClass: CustomDateAdapter },
    ],
    templateUrl: './filter-account.component.html',
    styles: ``,
    styleUrls: ['./filter-account.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterAccountComponent implements OnInit, AfterContentInit {
  @Output() filterChange = new EventEmitter<any>();
  @Output() searched = new EventEmitter();

  @Input() panelState = false;
  @Input() toggleActive = false;

  currencies: any[] = [];
  accounts: any[] = [];
  statuses = [true, false, null];

  filterForm = this.fb.group({
    fromAmount: new FormControl<number | null>(null),
    toAmount: new FormControl<number | null>(null),
    searchText: new FormControl<string>(''),
    currencyEnum: new FormControl<string>(''),
    customerId: new FormControl<string | null>(null),
    withBlock: new FormControl<boolean>(false),
    isActive: new UntypedFormControl('ACTIVE'),
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
  }

  toggleAccordion() {
    this.panelState = !this.panelState;
  }

  ngAfterContentInit() {
    setTimeout(() => {
      this.filterChange.emit(this.getFilterBody());
    })
  }


  get transactionModes () {
    return this.filterForm.get('transactionModes');
  }

  clearFilter() {
    this.filterForm.reset();
    this.filterForm.patchValue({
      searchText: '',
      currencyEnum: '',
      withBlock: false,
      isActive: 'ACTIVE'
    })
    this.filterChange.emit(this.getFilterBody());
  }

  search() {
    this.filter();
    this.searched.emit();
  }

  filter() {
    this.filterChange.emit(this.getFilterBody());
  }

  getFilterBody() {
    const filterBody: any = this.filterForm.getRawValue();
    filterBody.fromAmount = filterBody.fromAmount ? filterBody.fromAmount * 100 : null;
    filterBody.toAmount = filterBody.toAmount ? filterBody.toAmount * 100 : null;
    if(filterBody.isActive === 'ACTIVE') {
      filterBody.isActive = true;
    } else if(filterBody.isActive === 'INACTIVE') {
      filterBody.isActive = false;
    } else if(filterBody.isActive === 'ALL') {
      delete filterBody.isActive;
    }
    return filterBody
  }

  getCurrencies() {
    this.accountsPaymentsService.getCurrencies()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          if(res) {
            this.currencies = res;
            this._cdRef.markForCheck();
          }
        }
      })
  }

  getAccounts(search: any) {
    this.accountService.getAccountList({ size: 100, page: 0 } ,search)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          if(res) {
            this.accounts = res.content.map((el: any) => el.altAcctId);
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
        if(!(key === 'isReal') && !(key === 'withBlock')) {
          activeFilters.push({ key, value });
        }
      }
    });

    return activeFilters;
  }

  removeFilter(key: string): void {
    const control = this.filterForm.get(key);
    if (control) {
      control.reset(key === 'type' ? 'ANY' : null); // Reset type to 'ANY', others to null
    }
  }

  formatFilter(key: string, value: any): string {
    const keyMap: { [key: string]: string } = {
      searchText: 'Поиск',
      fromAmount: 'Сумма от',
      toAmount: 'Сумма до',
      currency: 'Валюта',
      currencyEnum: 'Валюта',
      withBlock: 'C блокированными',
      isActive: 'Статус',
    };

    let val = value;

    if (key === 'isActive') {
      if(value === 'ACTIVE') {
        val = 'Активные';
      } else if (value === 'INACTIVE') {
        val = 'Неактивные';
      } else if(value === 'ALL') {
        val = 'Все';
      }
    }

    return `${keyMap[key] || key}: ${val}`;
  }

}
