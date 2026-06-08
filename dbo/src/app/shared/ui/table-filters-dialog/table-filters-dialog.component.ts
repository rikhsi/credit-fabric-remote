import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';

import { animate, style, transition, trigger } from "@angular/animations";

import { FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogClose } from '@angular/material/dialog';
import { defaultPeriods, FilterConfig } from '../../components/table-filters/table-filters.model';
import { IconComponent } from '../icon/icon.component';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatChip, MatChipRemove } from '@angular/material/chips';
import { endOfDay, startOfDay } from '../../lib/date.utils';
import { NgxMaskDirective } from 'ngx-mask';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-filter-modal',
  templateUrl: './table-filters-dialog.component.html',
  imports: [
    CommonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    IconComponent,
    MatDialogClose,
    MatMenu,
    MatMenuTrigger,
    MatChip,
    MatChipRemove,
    NgOptimizedImage,
    NgxMaskDirective
  ],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scaleY(0.95)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'scaleY(1)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'scaleY(0.95)' }))
      ])
    ])
  ],
  styles: [
    `
      .cdk-overlay-container {
        z-index: 2000 !important;
      }
      ::ng-deep .mat-calendar-body-selected {
        background-color: #00A38D !important;
      }
    `
  ]
})
export class TableFiltersDialogComponent {
  data: { filterConfig: FilterConfig[], form: FormGroup } = inject(MAT_DIALOG_DATA);

  changedValue = signal({});

  triggerChangedValue = toSignal(this.data.form.valueChanges, { initialValue: this.data.form.value });

  test = effect(() => {
    this.changedValue.update(prev => ({
      ...prev,
      ...this.triggerChangedValue()
    }));
  })

  activePeriod = computed(() => {
    return (name: string, option: string) => {
      const item = this.changedValue()[name];

      if (item && item.start && item.end) {
        const isStartDateEqual = item.start.getTime() === defaultPeriods[option].start.getTime();
        const isEndDateEqual = item.end.getTime() === defaultPeriods[option].end.getTime();
        return isStartDateEqual && isEndDateEqual;
      }
      return false;
    };
  });

  setDefaultPeriod(value: string, name: string) {
    this.changedValue.update(prev => ({
      ...prev,
      [name]: { start: defaultPeriods[value].start, end: defaultPeriods[value].end }
    }));
  }

  changeDate(value, name: string, control: string) {
    this.changedValue.update(prev => ({
      ...prev,
      [name]: { ...prev[name], [control]: control === 'start' ? startOfDay(value) : endOfDay(value) },
    }));
  }

  setSelect(name: string, value: string | undefined) {
    this.changedValue.update(prev => ({ ...prev, [name]: value }));
  }

  submit() {
    this.data.form.patchValue(this.changedValue());
  }

  resetValues() {
    this.changedValue.set({});
    this.data.form.reset();
  }

  changeAmount(name: string, e) {
    this.changedValue.update(prev => ({ ...prev, [name]: e.target.value }));
  }
}
