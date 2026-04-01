import { ChangeDetectionStrategy, Component } from '@angular/core';
import { InputSlider, LabelControl } from '@shared/components';

@Component({
  selector: 'cf-calculator-form',
  imports: [InputSlider, LabelControl],
  templateUrl: './calculator-form.html',
  styleUrl: './calculator-form.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalculatorForm {}
