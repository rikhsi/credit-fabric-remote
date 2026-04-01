import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NzTagComponent } from 'ng-zorro-antd/tag';
import { DecimalPipe } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';
import { Card } from '@shared/components';
import { PluralizePipe } from '@shared/pipes';

@Component({
  selector: 'cf-calculator-result',
  imports: [Card, NzTagComponent, DecimalPipe, PluralizePipe, TranslocoPipe],
  templateUrl: './calculator-result.html',
  styleUrl: './calculator-result.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalculatorResult {
  readonly loanAmount = input<string | number>();
  readonly monthlyPayment = input<string | number>();
  readonly interestRate = input<string | number>();
  readonly documents = input<string[]>([]);
}
