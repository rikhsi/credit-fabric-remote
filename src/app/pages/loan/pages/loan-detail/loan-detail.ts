import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CalculatorForm, CalculatorResult, CardAdvantage, ProductAcception, ProductInfo } from '@pages/loan/components';

@Component({
  selector: 'cf-loan-detail',
  imports: [CardAdvantage, ProductInfo, CalculatorForm, CalculatorResult, ProductAcception],
  templateUrl: './loan-detail.html',
  styleUrl: './loan-detail.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoanDetail {}
