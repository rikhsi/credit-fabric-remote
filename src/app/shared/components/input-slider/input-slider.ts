import { ChangeDetectionStrategy, Component, computed, effect, inject, input, model, untracked } from '@angular/core';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { NgxMaskDirective } from 'ngx-mask';
import { FormsModule } from '@angular/forms';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { translate, TranslocoService } from '@jsverse/transloco';
import { ControlBaseDirective } from '@shared/directives';
import { PluralizePipe } from '@shared/pipes';
import { formatScaledNumber, pluralize } from '@shared/utils';
import { PLURALIZE_FORMS_BY_TYPE, SCALE_PREFIXES_BY_VALUE } from '@app/constants/prefix';
import { PluralizeType } from '@app/typings/pluralize';

function snapToStep(value: number, min: number, max: number, step: number): number {
  const snapped = Math.round((value - min) / step) * step + min;

  return Math.min(max, Math.max(min, snapped));
}

function shouldSnapToStep(min: number, max: number, step?: number): boolean {
  return step != null && step > 0 && (max - min) / step <= 5;
}

function clampToRange(value: number, min: number | null | undefined, max: number | null | undefined, step?: number): number {
  let result = value;

  if (min != null && result < min) {
    result = min;
  }

  if (max != null && result > max) {
    result = max;
  }

  if (min != null && max != null && shouldSnapToStep(min, max, step)) {
    result = snapToStep(result, min, max, step!);
  }

  return result;
}

@Component({
  selector: 'cf-input-slider',
  imports: [FormsModule, NzSliderModule, NzInputDirective, FormsModule, NgxMaskDirective, PluralizePipe],
  templateUrl: './input-slider.html',
  styleUrl: './input-slider.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputSlider extends ControlBaseDirective<number> {
  value = model(null);
  readonly step = input<number | undefined>(undefined);
  readonly transloco = inject(TranslocoService);
  readonly prefixType = input<PluralizeType>('money');
  readonly prefixInputType = input<PluralizeType>('money');

  marksArray = computed(() => {
    const min = this.min();
    const max = this.max();
    const step = this.step();

    if (min == null || max == null) return [];

    const type = this.prefixType();

    const make = (v: number) => {
      if (type === 'money') {
        return formatScaledNumber(v, SCALE_PREFIXES_BY_VALUE);
      }

      return `${v} ${translate(pluralize(v, PLURALIZE_FORMS_BY_TYPE[type]))}`;
    };

    if (shouldSnapToStep(min, max, step)) {
      const marks = [];

      for (let value = min; value <= max; value += step) {
        marks.push({
          value,
          label: make(value),
          pos: max === min ? 0 : ((value - min) / (max - min)) * 100,
        });
      }

      return marks;
    }

    const mid = Math.round(min + (max - min) / 2);

    return [
      { value: min, label: make(min), pos: 0 },
      { value: mid, label: make(mid), pos: 50 },
      { value: max, label: make(max), pos: 100 },
    ];
  });

  constructor() {
    effect(() => {
      const min = this.min();
      const max = this.max();
      const step = this.step();

      const val = untracked(() => this.value());

      if (val === null) return;

      const newVal = clampToRange(val, min, max, step);

      if (newVal !== val) {
        this.value.set(newVal);
      }
    });

    super();
  }

  override onBlur() {
    const val = this.value();
    if (val === null) return;

    const newVal = clampToRange(val, this.min(), this.max(), this.step());

    if (newVal !== val) {
      this.value.set(newVal);
    }

    super.onBlur();
  }
}
