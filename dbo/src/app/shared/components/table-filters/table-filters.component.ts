import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { MatChip, MatChipRemove } from '@angular/material/chips';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { FindOptionPipe } from './find-option.pipe';
import { toSignal } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs';
import { DatePipe } from '@angular/common';
import { defaultPeriods, FilterConfig } from "./table-filters.model";
import { IconComponent } from '../../ui/icon/icon.component';
import { MatDialog } from '@angular/material/dialog';
import { TableFiltersDialogComponent } from '../../ui/table-filters-dialog/table-filters-dialog.component';
import {
  MatDatepickerActions, MatDatepickerApply, MatDatepickerCancel,
  MatDateRangeInput,
  MatDateRangePicker, MatEndDate,
  MatStartDate
} from '@angular/material/datepicker';
import {TranslateModule} from "@ngx-translate/core";

@Component({
  selector: 'app-table-filters',
  imports: [
    MatChip,
    MatChipRemove,
    MatMenu,
    MatMenuTrigger,
    FindOptionPipe,
    ReactiveFormsModule,
    IconComponent,
    DatePipe,
    MatDateRangePicker,
    MatDateRangeInput,
    MatStartDate,
    MatEndDate,
    MatDatepickerActions,
    MatDatepickerApply,
    MatDatepickerCancel,
    TranslateModule
  ],
  templateUrl: './table-filters.component.html',
  styleUrls: ['./table-filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableFiltersComponent {
  filterConfig = input<FilterConfig[]>([]);
  showFilterDialog = input<boolean>(false);
  valueChange = output<any>();

  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);

  public form = this.fb.group({});

  private _cfgEffect = effect(() => {
    this.filterConfig().forEach(item => {
      if (item.type === 'period') {
        this.form.addControl( item.name, this.fb.group({
            start: this.fb.control<Date | null>(null),
            end: this.fb.control<Date | null>(null),
          })
        );
        return;
      }
      this.form.addControl(item.name, this.fb.control(''));
    });
  });

  private _logEffect = effect(() => {
    if (this.formValue()) {
      this.valueChange.emit(this.formValue());
    }
  });

  private readonly formValue = toSignal(
    this.form.valueChanges.pipe(debounceTime(200))
  );

  setSelect(name: string, value: string | undefined) {
    this.form.get(name)?.patchValue(value);
  }

  setPeriod(name: string, value) {
    this.form.get(name)?.setValue(defaultPeriods[value]);
  }

  clearSelect(name: string) {
    this.form.get(name)?.patchValue('');
  }

  clearPeriod(name: string) {
    this.form.get(name)?.patchValue({
      start: null,
      end: null
    });
  }

  openFilterDialog() {
    this.dialog.open(TableFiltersDialogComponent, {
      width: '550px',
      height: '100%',
      position: { right: '0' },
      panelClass: 'right-side-dialog',
      data: { filterConfig: this.filterConfig(), form: this.form },
    });
  }

  resetAll() {
    this.filterConfig().forEach(item => {
      if (item.type === 'period') {
        this.form.get(item.name)?.patchValue({ start: null, end: null });
      } else {
        this.form.get(item.name)?.patchValue('');
      }
    });
  }

  get hasActiveFilters(): boolean {
    return this.filterConfig().some(item => {
      const val = this.form.get(item.name)?.value;
      if (item.type === 'period') return val?.start && val?.end;
      return !!val;
    });
  }
}
