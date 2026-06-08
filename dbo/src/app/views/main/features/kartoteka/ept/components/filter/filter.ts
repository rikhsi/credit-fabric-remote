// Angular
import { TranslateModule} from "@ngx-translate/core"
import { NgClass, NgForOf, NgIf, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  input,
  OnInit,
  Output, signal,
  ViewChild
} from '@angular/core';

import { MatMenu, MatMenuTrigger } from "@angular/material/menu";
import { MatChip, MatChipRemove } from '@angular/material/chips';

import { NgxMaskDirective, NgxMaskPipe } from "ngx-mask";
import { debounceTime, distinctUntilChanged } from "rxjs";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';


// UTILS
import { handleKeyDown, parseToCents } from 'src/app/core/utils/global-filter.util';
import { getDateRange, PeriodType, detectPeriodLabel, formatDate } from 'src/app/core/utils/date.utils';
import { clearAllFormFilters, hasAnyFormFilter, removeFormFilter } from 'src/app/core/utils/form-filter.util';


// Interface
import { FilterForm, FilterKeys, STATUSES } from "../../../models/kartoteka.model"
import { BaseKartotekaStore } from '../../../store/base-kartoteka-store';
import { Kartoteka2Store } from '../../../store/kartoteka2.store';
import {
  MatDatepickerActions,
  MatDatepickerApply,
  MatDatepickerCancel,
  MatDateRangePicker,
  MatDateRangeInput,
  MatEndDate, MatStartDate
} from "@angular/material/datepicker";
import {MatInput} from "@angular/material/input";

@Component({
  selector: 'Filters',
  imports: [
    NgIf,
    NgForOf,
    NgClass,
    NgOptimizedImage,
    MatChip,
    MatMenu,
    MatChipRemove,
    MatMenuTrigger,
    FormsModule,
    ReactiveFormsModule,
    NgxMaskDirective,
    NgxMaskPipe,
    TranslateModule,
    MatDateRangePicker,
    MatDatepickerActions,
    MatDatepickerApply,
    MatDatepickerCancel,
    MatDateRangeInput,
    MatEndDate,
    MatStartDate,
    MatInput
  ],
  styles: [
    `
      ::ng-deep .mat-calendar-body-selected {
        background-color: #00A38D !important;
      }

    `
  ],
  templateUrl: './filter.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})



export class FilterComponent implements OnInit {
  @Output() filterChange = new EventEmitter<any>();
  isVisible = input(false)
  private readonly builder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  protected baseKartoteka2Store = inject(BaseKartotekaStore)
  protected kartoteka2Store = inject(Kartoteka2Store)
  recipientType = signal<string>('EPT_INCOMING')

  // FORM
  filterForm = this.builder.group({
    searchText: new FormControl<string | null>(null),
    fromDate: new FormControl<any | null>(null),
    toDate: new FormControl<any | null>(null),
    statusList: new FormControl<STATUSES[] | null>(null),
    coName: new FormControl<string | null>(null),
    fromAmount: new FormControl<number | null>(null),
    toAmount: new FormControl<number | null>(null),
  });


  amountFilter = this.builder.group({
    minAmount: new FormControl<number | null>(null),
    maxAmount: new FormControl<number | null>(null),
  })

  searchbyRecipient = new FormControl('');
  statusListToMap: { name: string; value: string; img: string }[] = [];
  showAmountChip: boolean = false


  ngOnInit() {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef))
      .subscribe((formValue) => {
        if (!formValue) return;
        const filters = {
          search: formValue.searchText?.trim() || null,
          coName: formValue.coName?.trim() || null,
          fromDate: formatDate(formValue.fromDate),
          toDate: formatDate(formValue.toDate),
          fromAmount: parseToCents(formValue.fromAmount),
          toAmount: parseToCents(formValue.toAmount),
          statusList: formValue.statusList || [],
        };
        this.filterChange.emit(filters);
      });

    this.searchbyRecipient.valueChanges.pipe(debounceTime(800)).subscribe((search) => {
      this.baseKartoteka2Store.loadRecipients(search, this.recipientType());

    });

    this.baseKartoteka2Store.loadRecipients('', this.recipientType())
    this.kartoteka2Store.loadStatuses()
  }

  protected getSelectedStatus(): { name: string; value: string; img: string } | null {
    const selectedStatus = this.filterForm.value.statusList?.[0];
    if (!selectedStatus) return null;

    return this.kartoteka2Store.statusListToMap().find(res => res.value === selectedStatus) || null;
  }

  protected isShowStatus() {
    if (this.filterForm.value.statusList && this.filterForm.value.statusList.length == 1) {
      return true
    } else {
      return false
    }
  }


  setFilter(value: any, field: FilterKeys) {
    if (field === "statusList") {
      this.filterForm.patchValue({ [field]: [value] });
    } else if (field === "coName") {
      this.filterForm.patchValue({ [field]: value });
      this.searchbyRecipient.reset('');
    }
    else {
      this.filterForm.patchValue({ [field]: value });
    }
  }





  clearAmount() {
    this.amountFilter.patchValue({ minAmount: null, maxAmount: null });
  }

  clearSearch(event: Event): void {
    event.stopPropagation();
    this.searchbyRecipient.reset('');
  }

  clearAllFilters(): void {
    clearAllFormFilters(this.filterForm);
  }



  removeFilter(key: FilterKeys): void {
    removeFormFilter(this.filterForm, key);
  }

  hasAnyFilter(): boolean {
    return hasAnyFormFilter(this.filterForm);
  }


  handleApply() {
    const { minAmount, maxAmount } = this.amountFilter.value;
    console.log(minAmount, maxAmount, "ffdfd")
    this.filterForm.patchValue({
      fromAmount: minAmount,
      toAmount: maxAmount,
    });
    this.clearAmount()
  }


  handleReset(event: Event) {
    // event.stopPropagation();
    this.clearAmount()
    this.filterForm.patchValue({ fromAmount: null, toAmount: null });
  }


  setDate(period: PeriodType) {
    const { startDate, endDate } = getDateRange(period)
    this.filterForm.patchValue({ fromDate: startDate, toDate: endDate })
  }


  getAmountChipText(): string {
    const { fromAmount, toAmount } = this.filterForm.value;
    if (fromAmount && toAmount)
      return `от: ${fromAmount.toLocaleString('ru')} - до: ${toAmount.toLocaleString('ru')}`;
    if (fromAmount) return `от: ${fromAmount.toLocaleString('ru')}`;
    if (toAmount) return `до: ${toAmount.toLocaleString('ru')}`;
    return '';
  }
  protected formatDate = formatDate
  protected handleKeyDown = handleKeyDown
  protected detectPeriodLabel = detectPeriodLabel
}
