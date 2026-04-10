import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { NgxMaskDirective } from 'ngx-mask';
import { FormsModule } from '@angular/forms';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { PluralizeType } from '@typings';
import { ControlBaseDirective } from '@shared/directives';
import { PluralizePipe } from '@shared/pipes';

@Component({
  selector: 'cf-input-slider',
  imports: [FormsModule, NzSliderModule, NzInputDirective, FormsModule, NgxMaskDirective, PluralizePipe],
  templateUrl: './input-slider.html',
  styleUrl: './input-slider.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputSlider extends ControlBaseDirective<number> {
  readonly step = input<number | undefined>(undefined);
  readonly prefixType = input<PluralizeType>('money');

  onBlur() {
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
  }
}
