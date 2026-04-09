import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { CalculatorForm, CalculatorResult, CardAdvantage, ProductAcception, ProductInfo } from '@pages/loan/components';
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
  readonly advantagePhoto = 'images/advantage.png';

  readonly advantages: readonly LoanAdvantageItem[] = [
    {
      title: 'Низкий процент',
      description: 'Получите кредит на выгодных условиях',
    },
    {
      title: 'Удобно погашать',
      description: 'Вносите ежемесячный платеж в мобильном приложении Hamkor',
    },
    {
      title: 'Быстрое решение',
      description: 'Узнайте о решении онлайн за 1 минуту',
    },
    {
      title: 'На любые цели',
      description: 'Используйте деньги на любые цели',
    },
  ];
}
