import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'cf-calculator-result',
  imports: [],
  templateUrl: './calculator-result.html',
  styleUrl: './calculator-result.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalculatorResult {}
