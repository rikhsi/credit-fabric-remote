import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  EventEmitter, Input,
  OnInit,
  Output
} from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { DateAdapter, MatOption, provideNativeDateAdapter } from '@angular/material/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FilterButtonComponent
} from '../../../../../../shared/components/common/filter-button/filter-button.component';
import { MatChip, MatChipSet } from '@angular/material/chips';
import { MatAccordion, MatExpansionPanel } from '@angular/material/expansion';
import { AccountSelectComponent } from '../../../../../../shared/components/account-select/account-select.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
  MatDateRangeInput, MatDateRangePicker, MatEndDate, MatStartDate
} from '@angular/material/datepicker';
import { MatLabel, MatSelect } from '@angular/material/select';
import { MatInput } from '@angular/material/input';
import { NgOptimizedImage, NgTemplateOutlet } from '@angular/common';
import { appTabs } from '../../constants/app-tab';
import { debounceTime } from 'rxjs';
import { tableAppsActionBtns } from '../../constants/action-btns';
import { CustomDateAdapter } from '../../../../../../core/services/custom-date-adapter.service';

@Component({
    selector: 'app-app-filter',
    imports: [
        FilterButtonComponent,
        ReactiveFormsModule,
        MatChipSet,
        MatChip,
        MatAccordion,
        MatExpansionPanel,
        AccountSelectComponent,
        MatFormFieldModule,
        MatIcon,
        MatDatepickerInput,
        MatDatepickerToggle,
        MatDatepicker,
        MatSelect,
        MatOption,
        MatInput,
        MatLabel,
        NgTemplateOutlet,
        NgOptimizedImage,
        MatDateRangeInput,
        MatDateRangePicker,
        MatEndDate,
        MatStartDate,
    ],
    templateUrl: './app-filter.component.html',
    providers: [
        provideNativeDateAdapter(),
        { provide: DateAdapter, useClass: CustomDateAdapter },
    ],
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppFilterComponent implements OnInit {
  @Output() filterChange = new EventEmitter();
  currencies: any[] = [];

  @Input() disableType = false;
  @Input() dateRange = false;

  @Input() panelState = false;
  @Input() toggleActive = false;

  types = appTabs;
  tableActionBtns = tableAppsActionBtns;

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
    applicationTypes: [[this.types[0].value]],
    type: new FormControl<string | null>(this.types[0].value),
  });

  constructor(
    private fb: FormBuilder,
    private destroyRef: DestroyRef,
    private _cdRef: ChangeDetectorRef,
  ) {
  }

  ngOnInit() {
    this.search();
    this.watchInput();
  }

  watchInput() {
    this.filterForm.controls.searchText.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef), debounceTime(600))
      .subscribe((res) => {
        this.search();
      })
  }

  search() {
    const amountFrom = this.filterForm.value.amountFrom;
    const amountTo = this.filterForm.value.amountFrom;
    const form = this.filterForm.getRawValue();
    let { type, ...body } = form;
    let all: string[] = [];
    if(type === 'ALL') {
      all = this.types.filter(el => el.value !== 'ALL').map(el => el.value);
    }
    if(type) {
      body.applicationTypes = type !== 'ALL' ? [type] : all;
    }
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
      type: this.types[0].value,
    });
  }
}
