import {
  Component, signal, computed, input, viewChild, effect, inject, DestroyRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { IconComponent } from '../icon/icon.component';
import { MONTH_NAMES } from '../../../features/payroll/statement-form/statement-form.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StatementFormStore } from '../../../features/payroll/statement-form/statement-form.store';
import { monthIndexByLabel } from '../../helpers/monthIndexByLabel';

@Component({
  selector: 'app-month-select-calendar',
  imports: [CommonModule, ReactiveFormsModule, MatMenuModule, MatChipsModule, IconComponent],

  templateUrl: './month-select-calendar.component.html',
  styles: `
     :host {
        // .selected_date {
        //   border-radius: var(--chip-radius, 8px) !important;
        //   border-width: var(--chip-border-width, 1px) !important;
        //   border-style: var(--chip-border-style, solid) !important;
        //   border-color: var(--chip-border-color, #00A38D) !important;
        // }
      }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MonthSelectCalendarComponent {
  parentForm = input.required<FormGroup>();
  borderRadius = input(8);           // px
  borderWidth = input(1);            // px  
  borderStyle = input('solid');      // solid | dashed | dotted
  borderColor = input('#00A38D');    // any CSS color

  private readonly trigger = viewChild.required<MatMenuTrigger>(MatMenuTrigger);

  readonly months = MONTH_NAMES.map((name, index) => ({ name, index }));

  readonly store = inject(StatementFormStore);
  private readonly destroy = inject(DestroyRef);

  year = signal(new Date().getFullYear());
  readonly monthIndexByLabel = monthIndexByLabel
  // Pending selection inside the menu (not yet applied)
  pendingMonths = signal<Set<number>>(new Set());

  // Applied months — shown as chip
  appliedMonths = signal<Set<number>>(new Set());

  canApply = computed(() => this.pendingMonths().size > 0);

  // Labels for applied months sorted by index
  appliedLabels = computed(() => {
    const applied = this.appliedMonths();
    return Array.from(applied)
      .sort((a, b) => a - b)
      .map(i => MONTH_NAMES[i]);
  });

  changeYear(delta: number) {
    this.year.update(y => y + delta);
    this.pendingMonths.set(new Set());
  }

  selectMonth(index: number) {
    this.pendingMonths.update(set => {
      const next = new Set(set);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  }

  getMonthClasses(index: number): Record<string, boolean> {
    const isPending = this.pendingMonths().has(index);
    const isApplied = this.appliedMonths().has(index);
    return {
      'bg-[#00A38D] text-white font-medium': isPending,
      'bg-[#E6F7F5] text-[#00A38D] font-medium': !isPending && isApplied,
      'bg-transparent text-custom-primary hover:bg-surface-1': !isPending && !isApplied,
    };
  }

  cancel() {
    // Reset pending to currently applied state
    this.pendingMonths.set(new Set(this.appliedMonths()));
    this.trigger().closeMenu();
  }

  apply() {
    const selected = this.pendingMonths();
    if (!selected.size) return;

    const sorted = Array.from(selected).sort((a, b) => a - b);
    const months = sorted.map(i => String(i + 1).padStart(2, '0'));

    this.appliedMonths.set(new Set(selected));
    this.parentForm().patchValue({ year: this.year(), months });

    this.trigger().closeMenu();
  }

  clearAll() {
    this.appliedMonths.set(new Set());
    this.pendingMonths.set(new Set());
    this.parentForm().patchValue({ year: null, months: [] });
  }

  removeMonth(index: number) {
    this.appliedMonths.update(set => {
      const next = new Set(set);
      next.delete(index);
      return next;
    });
    this.pendingMonths.update(set => {
      const next = new Set(set);
      next.delete(index);
      return next;
    });

    const remaining = Array.from(this.appliedMonths()).sort((a, b) => a - b);
    if (remaining.length === 0) {
      this.parentForm().patchValue({ year: null, months: [] });
    } else {
      const months = remaining.map(i => String(i + 1).padStart(2, '0'));
      this.parentForm().patchValue({ year: this.year(), months });
    }
  }

  private update = effect(() => {
    const form = this.parentForm();

    form.controls['months'].valueChanges.pipe(
      takeUntilDestroyed(this.destroy)
    ).subscribe((months: string[]) => {
      const year = form.controls['year'].value as number;
      if (!months?.length || !year) {
        this.appliedMonths.set(new Set());
        this.pendingMonths.set(new Set());
        return;
      }

      this.year.set(year);
      const indices = new Set(months.map(m => Number(m) - 1));
      this.appliedMonths.set(indices);
      this.pendingMonths.set(new Set(indices));
    });
  });
}
