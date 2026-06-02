import { ChangeDetectionStrategy, Component, computed, effect, inject, input, untracked } from '@angular/core';
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

@Component({
  selector: 'cf-input-slider',
  imports: [FormsModule, NzSliderModule, NzInputDirective, FormsModule, NgxMaskDirective, PluralizePipe],
  templateUrl: './input-slider.html',
  styleUrl: './input-slider.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputSlider extends ControlBaseDirective<number> {
  readonly step = input<number | undefined>(undefined);
  readonly transloco = inject(TranslocoService);
  readonly prefixType = input<PluralizeType>('money');
  readonly prefixInputType = input<PluralizeType>('money');

  marksArray = computed(() => {
    const min = this.min();
    const max = this.max();

    if (!min || !max) return [];

    const mid = Math.round(min + (max - min) / 2);
    const type = this.prefixType();

    const make = (v: number) => {
      if (type === 'money') {
        return formatScaledNumber(v, SCALE_PREFIXES_BY_VALUE);
      }

      return `${v} ${translate(pluralize(v, PLURALIZE_FORMS_BY_TYPE[type]))}`;
    };

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

      const val = untracked(() => this.value());

      if (val === null) return;

      let newVal = val;

      if (min !== null && val < min) newVal = min;
      if (max !== null && val > max) newVal = max;

      if (newVal !== val) {
        this.value.set(newVal);
      }
    });

    super();
  }

  override onBlur() {
    const val = this.value();
    if (val === null) return;

    const min = this.min();
    const max = this.max();

    let newVal = val;

    if (min !== null && val < min) {
      newVal = min;
    }

    if (max !== null && val > max) {
      newVal = max;
    }

    if (newVal !== val) {
      this.value.set(newVal);
    }

    super.onBlur();
  }
}
