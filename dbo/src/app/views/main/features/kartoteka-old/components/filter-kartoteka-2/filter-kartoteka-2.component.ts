import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  Output,
  inject,
  signal
} from '@angular/core';
import {
  FilterButtonComponent
} from '../../../../../../shared/components/common/filter-button/filter-button.component';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAccordion, MatExpansionPanel } from '@angular/material/expansion';
import { MatChip, MatChipRemove, MatChipSet } from '@angular/material/chips';
import {
  MatDatepicker,
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker,
  MatEndDate,
  MatStartDate
} from '@angular/material/datepicker';
import { MatChipsModule } from '@angular/material/chips';

import { debounceTime, distinctUntilChanged, Subject, switchMap } from "rxjs";
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatOption } from '@angular/material/autocomplete';
import { MatSelect } from '@angular/material/select';
import { NgClass, NgIf, NgOptimizedImage, NgTemplateOutlet, NgForOf } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DateAdapter, provideNativeDateAdapter } from '@angular/material/core';
import { CustomDateAdapter } from '../../../../../../core/services/custom-date-adapter.service';
import { MatMenu, MatMenuTrigger } from "@angular/material/menu";
import { StatusCode, StatusListMap } from "./kartoteka-2.interface"
import { KartotekaService } from '../../services/kartoteka.service';

@Component({
  selector: 'app-filter-kartoteka-2',
  imports: [
    
    FilterButtonComponent,
    FormsModule,
    MatAccordion,
    MatChip,
    MatChipRemove,
    MatChipSet,
    MatExpansionPanel,
    MatFormField,
    MatIcon,
    MatInput,
    MatLabel,
    MatOption,
    MatSelect,
    MatSuffix,
    NgOptimizedImage,
    NgTemplateOutlet,
    ReactiveFormsModule,
    NgClass,
    MatDatepicker,
    MatDateRangeInput,
    MatDateRangePicker,
    MatDatepickerToggle,
    MatStartDate,
    MatEndDate,
    MatMenu,
    NgIf,
    NgForOf,
    MatMenuTrigger,
    MatChipsModule
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: DateAdapter, useClass: CustomDateAdapter },
  ],
  templateUrl: './filter-kartoteka-2.component.html',
  styles: ``,
  styleUrls: ['./filter-kartoteka-2.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})



export class FilterKartoteka2Component {
  @Output() filterChange = new EventEmitter<any>();
  @Output() searched = new EventEmitter();
  @Input() toggleActive = false;
  inputSubject = new Subject<any>();
  isLoading = signal<boolean>(false);
  errorMessage = '';
  reloading = false;
  isActiveStatus = false
  recipientList: string[] = [];
  private _kartotekaService = inject(KartotekaService)
  statusListToMap: { name: string; value: string; img: string }[] = [];
  searchbyRecipient = new FormControl('');
  showAmountChip = false;

  filterForm = this.fb.group({
    fromDate: new FormControl<any | null>(null),
    toDate: new FormControl<any | null>(null),
    fromAmount: new FormControl<number | null>(null),
    toAmount: new FormControl<number | null>(null),
    searchText: new FormControl<string | null>(null),
    statusList: new FormControl<("ACTIVE" | "DELETED" | "PARTIAL_CLOSED")[] | null>(["ACTIVE", "DELETED" , "PARTIAL_CLOSED"]),
    coName: new FormControl<string | null>(null),
  });

  constructor(
    private fb: FormBuilder,
    private destroyRef: DestroyRef,
    private _cdRef: ChangeDetectorRef,
  ) {
  }

  ngOnInit() {
    this.filterChange.emit(this.filterForm.value);
    this.inputSubject.pipe(debounceTime(800), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef)).subscribe((val) => {
      this.filterForm.patchValue({ searchText: val.target.value })
      this.search();
    });

    this.searchbyRecipient.valueChanges.pipe(debounceTime(800)).subscribe((search) => {
      if (search) {
        this.getRecipients(search);
      } else {
        this.getRecipients();
      }
    });

    this.getRecipients();
    this.getStatuses()
  }

  getRecipients(search?: string) {
    this.isLoading.set(true);
    if (this.reloading) {
      this.recipientList = []
      this._cdRef.detectChanges();
    }

    this._kartotekaService
      .getRecipientList(search)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (!res) return;
          this.recipientList = res.coNameList;
          this.errorMessage = '';
        },
        error: (err) => {
          this.errorMessage = err;
          this.isLoading.set(false);
          this.reloading = false;
          this._cdRef.markForCheck();
        },
        complete: () => {
          this.isLoading.set(false);
          this.reloading = false;
          this._cdRef.markForCheck();
        },
      });
  }

  getStatuses() {
    this._kartotekaService.getStatusList().subscribe({
      next: (res) => {
        if (res?.statusList) {
          const list = res.statusList;
          this.statusListToMap = Object.entries(list)
            .filter(([key]) => key !== StatusCode.UNKNOWN)
            .map(([key, value]) => ({
              value: key,
              name: value,
              img: this.getStatusIcon(key as StatusCode),
            }));
        }
      },
    });
  }

  getSelectedStatus(): string | null {
    const selectedStatus = this.filterForm.value.statusList?.[0];

    if (!selectedStatus) {
      return "";
    }

    const result = this.statusListToMap.find(res => res.value === selectedStatus);
    return result ? result.name : "";
  }

  handleKeyDown(e: any) {
    if (["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key))
      return;

    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };


  private getStatusIcon(status: StatusCode): string {
    switch (status) {
      case StatusCode.ACTIVE:
        return './assets/new-icons/planned-status.svg';
      case StatusCode.PARTIAL_CLOSED:
        return './assets/new-icons/partially-status.svg';
      case StatusCode.DELETED:
        return './assets/new-icons/enrolled-status.svg';
      default:
        return '';
    }
  }

  search() {
    this.filter();
    this.searched.emit();
  }

  isShowStatus(){
    if(this.filterForm.value.statusList &&  this.filterForm.value.statusList.length == 1){
      return true
    }else{
      return false
    }
  }

  filter() {
    const rawValues = this.filterForm.getRawValue();
    const {
      statusList,
      fromAmount,
      toAmount,
      fromDate,
      toDate,
      searchText,
      coName,
    } = rawValues;

    const filterBody = {
      statusList: Array.isArray(statusList) && statusList.length > 0 ? statusList : [],
      fromAmount: this.toCents(fromAmount),
      toAmount: this.toCents(toAmount),
      fromDate: this.formatDateSafe(fromDate),
      toDate: this.formatDateSafe(toDate),
      searchText: this.cleanText(searchText),
      coName: this.cleanText(coName),
    };

    this.filterChange.emit(filterBody);
  }
  

  private toCents(value: number | null | undefined): number | null {
    return typeof value === 'number' && !isNaN(value) ? value * 100 : null;
  }

  private formatDateSafe(date: any): string | null {
    return date ? this.formatDate(date) : null;
  }

  private cleanText(text: string | null | undefined): string | null {
    return text?.trim() || null;
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

  formatDate(date: string): string | null {
    if (!date) return null;
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  };

  hasAnyFilter(): boolean {
    const value = this.filterForm.value;
    return Object.keys(value).some(key => {
      const val = value[key];
      if (key === 'searchText' && !val) {
        return false;
      }
      if (key === 'statusList') {
        return Array.isArray(val) && val.length == 1;
      }
      return val !== null && val !== undefined && val !== '';
    });
  }

  clearAllFilters(): void {
    this.searchbyRecipient.reset('');
    Object.keys(this.filterForm.controls).forEach(key => {
      const control = this.filterForm.get(key);
      if (control) {
        const isSearchText = key === 'searchText';
        control.reset(isSearchText ? '' : null);
      }
    });
    this.filterForm.patchValue({
      statusList: ["ACTIVE", "DELETED" , "PARTIAL_CLOSED"],
    })
    this.search();

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
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0);

    return this.setFilter({ startDate, endDate }, "period")
  }

  setPeriodMonth() {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    return this.setFilter({ startDate, endDate }, "period")
  }

  setFilter(value: any, type: string) {
    if (type === "status") {
      this.filterForm.patchValue({
        statusList: [value]
      })
      this.search();
    } else if (type === "period") {
      this.filterForm.patchValue({
        fromDate: value.startDate,
        toDate: value.endDate,
      })
      this.search();
    }
    else if (type === "recipient") {
      this.filterForm.patchValue({ coName: value })
      this.search();
    }
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
      return `Сегодня ${format(startDate)}`;
    }

    if (startDate.getTime() === yesterdayStart.getTime() && endDate.getTime() === yesterdayEnd.getTime()) {
      return `Вчера ${format(startDate)}`;
    }

    if (startDate.getTime() === weekStart.getTime() && endDate.getTime() === weekEnd.getTime()) {
      return `${format(weekStart)} – ${format(weekEnd)}`;
    }

    if (startDate.getTime() === monthStart.getTime() && endDate.getTime() === monthEnd.getTime()) {
      return `${format(monthStart)} – ${format(monthEnd)}`;
    }

    return `${format(startDate)} – ${format(endDate)}`;
  }

  removeFilter(key: string): void {
    this.showAmountChip = false
    const control = this.filterForm.get(key);
    if (control) {
      const isSearchText = key === 'searchText';
      control.reset(isSearchText ? '' : null);
      this.filterForm.patchValue({
        statusList: ["ACTIVE", "DELETED" , "PARTIAL_CLOSED"],
      })
    }
    this.search();
  }
}




