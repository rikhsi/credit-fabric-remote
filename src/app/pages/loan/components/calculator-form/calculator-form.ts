import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'cf-calculator-form',
  imports: [],
  templateUrl: './calculator-form.html',
  styleUrl: './calculator-form.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalculatorForm {}
