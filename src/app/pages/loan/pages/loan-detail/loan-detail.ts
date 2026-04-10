import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { CalculatorForm, CalculatorResult, CardAdvantage, ProductAcception, ProductInfo } from '@pages/loan/components';
import { LOAN_ADVANTAGES_LIST } from '@pages/loan/data';
import { LoanAdvantageItem } from '@pages/loan/models';
import { Card } from '@shared/components';

@Component({
  selector: 'cf-loan-detail',
  imports: [CardAdvantage, ProductInfo, CalculatorForm, CalculatorResult, ProductAcception, Card, TranslocoDirective],
  templateUrl: './loan-detail.html',
  styleUrl: './loan-detail.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoanDetail {
  readonly advantages: readonly LoanAdvantageItem[] = LOAN_ADVANTAGES_LIST;
}
