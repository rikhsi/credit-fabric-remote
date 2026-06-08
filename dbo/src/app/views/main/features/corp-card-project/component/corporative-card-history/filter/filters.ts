import { NgClass, NgForOf, NgIf, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  OnInit,
  output,
  Output,
  ViewChild
} from '@angular/core';
import {TranslateModule} from "@ngx-translate/core"
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from "rxjs";
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatMenu, MatMenuTrigger } from "@angular/material/menu";
import { MatChip, MatChipRemove } from '@angular/material/chips';
import { DateAdapter, provideNativeDateAdapter } from '@angular/material/core';
import {
  MatDatepicker, MatDatepickerActions, MatDatepickerApply, MatDatepickerCancel,
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker,
  MatEndDate,
  MatStartDate,
} from '@angular/material/datepicker';

import { CustomDateAdapter } from '../../../../../../../core/services/custom-date-adapter.service';

import { Trancations } from "../../../constants/corp-card-constants"

import { FilterHistoryKeys } from "../../corporative-card/filter/model"
import { MatDialog } from '@angular/material/dialog';
import { HistoryFilterDialogComponent } from '../../dialogs/history-filter/filters';
import { paymentMapNew, statusListToMap } from '../../../../transaction-detail/model/transaction-detail.interface';

import { clearAllFormFilters, hasAnyFormFilter, removeFormFilter } from 'src/app/core/utils/form-filter.util';
import { handleKeyDown } from 'src/app/core/utils/global-filter.util';
import { detectPeriodLabel, getDateRange, PeriodType } from 'src/app/core/utils/date.utils';
import {MatInput} from "@angular/material/input";

@Component({
  selector: 'Filters',
  styleUrls: ['./filter.scss'],

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
    MatDatepicker,
    MatDateRangeInput,
    MatDateRangePicker,
    MatDatepickerToggle,
    MatStartDate,
    MatEndDate,
    TranslateModule,
    MatDatepickerActions,
    MatDatepickerApply,
    MatDatepickerCancel,
    MatInput
  ],


  providers: [
    provideNativeDateAdapter(),
    { provide: DateAdapter, useClass: CustomDateAdapter },
  ],

  templateUrl: './filters.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})



export class CardCardHistoryFilter implements OnInit {
  @Output() filterChange = new EventEmitter<any>();
  hasFilter = output<boolean>()
  @ViewChild(MatDateRangePicker) picker!: MatDateRangePicker<Date>;

  private fb = inject(FormBuilder)
  private destroyRef = inject(DestroyRef)
  private dialog = inject(MatDialog)

  protected showAmountChip = false;
  protected backAction = output<string>()


  filterForm = this.fb.group({
    searchText: new FormControl<string | null>(null),
    isCredit: new FormControl<number | null>(null),
    startDate: new FormControl<any | null>(null),
    endDate: new FormControl<any | null>(null),
    fromAmount: new FormControl<number | null>(null),
    toAmount: new FormControl<number | null>(null),
    status: new FormControl<string | null>(null),
    isSignable: new FormControl<boolean | null>(null)
  });


  ngOnInit() {
    this.filterForm.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((formValue) => {
        this.filterChange.emit(formValue);
      });

  }
  openCustomDate(): void {
    this.picker.open();
  }

  protected setFilterFromPopUp(filters: any) {
    this.filterForm.patchValue(filters)
    this.filterChange.emit(filters);
  }

  protected setFilter(value: any, field: FilterHistoryKeys) {
    if (field === "period") {
      this.filterForm.patchValue({
        startDate: value.startDate,
        endDate: value.endDate,
      })
    } else {
      this.filterForm.patchValue({ [field]: value });
    }
  }

  protected removeFilter(key: any): void {
    removeFormFilter(this.filterForm, key);
  }

  protected clearAllFilters(): void {
    clearAllFormFilters(this.filterForm);
  }

  protected hasAnyFilter(): boolean {

    let result = hasAnyFormFilter(this.filterForm);
    this.hasFilter.emit(result)
    return result;
  }

  protected setDate(period: PeriodType) {
      const { startDate, endDate } = getDateRange(period)
      this.filterForm.patchValue({ startDate, endDate })
    }

  protected getSelected() {
    const selectedType = this.filterForm.value?.isCredit;
    switch (selectedType) {
      case 2:
        return Trancations.find(item => item?.type === "ALL") ?? null;
      case 1:
        return Trancations.find(item => item?.type === "OUTCOME") ?? null; // Исходящие
      case 0:
        return Trancations.find(item => item?.type === "INCOME") ?? null;  // Входящие
      default:
        return null;
    }
  }

  protected showFilterDialog() {
    const dialog = this.dialog.open(HistoryFilterDialogComponent, {
      width: '550px',
      height: '100%',
      position: { right: '0' },
      panelClass: 'right-side-dialog',
      disableClose: true,
      data: {
        setFilter: (value: any) => this.setFilterFromPopUp(value),
        filterForm: this.filterForm.value,
      }
    });

    dialog.componentInstance.onDetail.subscribe(res => {
      this.backAction.emit(res)
      dialog.close()
    })
  }
  onApply() {
    // this.search();
    console.log(2343243)
  }
  protected handleKeyDown = handleKeyDown
  protected detectPeriodLabel = detectPeriodLabel

  protected readonly paymentMap = paymentMapNew;
  protected readonly Trancations = Trancations
  protected readonly statusListToMap = statusListToMap;
}
