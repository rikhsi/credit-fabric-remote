import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NzTagComponent } from 'ng-zorro-antd/tag';
import { DecimalPipe, NgClass } from '@angular/common';
import { TranslocoPipe, TranslocoDirective } from '@jsverse/transloco';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { Card, LabelControlSecondary } from '@shared/components';
import { PluralizePipe } from '@shared/pipes';
import { CreditType } from '@app/typings/calculator';

@Component({
  selector: 'cf-calculator-result',
  imports: [
    Card,
    NzTagComponent,
    DecimalPipe,
    PluralizePipe,
    TranslocoPipe,
    LabelControlSecondary,
    TranslocoDirective,
    NzSkeletonModule,
    NgClass,
  ],
  templateUrl: './calculator-result.html',
  styleUrl: './calculator-result.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalculatorResult {
  readonly creditType = input<CreditType>('annuity');
  readonly loanAmount = input<number>();
  readonly monthlyPayment = input<number>();
  readonly isLoading = input<boolean>(false);
  readonly annualRate = input<number>();
  readonly documents = input<string[]>([]);
}
