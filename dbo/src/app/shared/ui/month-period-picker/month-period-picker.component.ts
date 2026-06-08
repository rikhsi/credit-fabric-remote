import { Component, signal, computed, forwardRef, input, viewChild, effect, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatChipsModule } from '@angular/material/chips';
import { IconComponent } from '../icon/icon.component';
import { MONTH_NAMES } from '../../../features/payroll/statement-form/statement-form.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {StatementFormStore} from "../../../features/payroll/statement-form/statement-form.store";

@Component({
  selector: 'app-month-period-picker',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatMenuModule, MatDatepickerModule, MatChipsModule, IconComponent],
  templateUrl: './month-period-picker.component.html',
})
export class MonthPeriodPickerComponent {
  parentForm = input.required<FormGroup>();

  private readonly trigger = viewChild.required<MatMenuTrigger>(MatMenuTrigger);

  readonly months = MONTH_NAMES.map((name, index) => ({ name, index }));

  readonly store = inject(StatementFormStore);
  private readonly destroy = inject(DestroyRef)

  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  year = signal(new Date().getFullYear());

  selectedMonths = signal<Set<number>>(new Set());

  canApply = computed(() => this.selectedMonths().size > 0);

  changeYear(delta: number) {
    this.year.update(y => y + delta);
    this.selectedMonths.set(new Set());
  }

  selectMonth(index: number) {
    this.selectedMonths.update(set => {
      const next = new Set(set);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  }

  getMonthState(index: number): 'selected' | 'none' {
    return this.selectedMonths().has(index) ? 'selected' : 'none';
  }

  getMonthClasses(state: 'selected' | 'none'): Record<string, boolean> {
    return {
      'bg-[#00A38D] text-white font-medium': state === 'selected',
      'bg-transparent text-custom-primary hover:bg-surface-1': state === 'none',
    };
  }

  cancel() {
    this.selectedMonths.set(new Set());
    this.trigger().closeMenu();
  }

  apply() {
    const selected = this.selectedMonths();
    if (!selected.size) return;

    const sorted = Array.from(selected).sort((a, b) => a - b);

    const months = sorted.map(i => String(i + 1).padStart(2, '0'));

    this.parentForm().patchValue({ year: this.year(), months });

    const lo = sorted[0];
    const hi = sorted[sorted.length - 1];

    this.range.setValue({
      start: new Date(this.year(), lo, 1),
      end: new Date(this.year(), hi + 1, 0),
    });

    this.selectedMonths.set(new Set());
    this.trigger().closeMenu();
  }

  clearRange() {
    this.range.reset();
    this.selectedMonths.set(new Set());
    this.parentForm().patchValue({ year: null, months: [] });
  }


  private update = effect(() => {
    const form = this.parentForm();

    form.controls['months'].valueChanges.pipe(
      takeUntilDestroyed(this.destroy)
    ).subscribe((months: string[]) => {
      const year = form.controls['year'].value as number;
      if (!months?.length || !year) return;

      this.year.set(year);

      this.selectedMonths.set(new Set(months.map(m => Number(m) - 1)));

      const lo = Number(months[0]) - 1;
      const hi = Number(months[months.length - 1]) - 1;

      this.range.setValue({
        start: new Date(year, lo, 1),
        end: new Date(year, hi + 1, 0),
      });
    });
  });
}
