import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CalculatorForm, CalculatorResult, CardAdvantage, ProductAcception, ProductInfo } from '@pages/loan/components';
import { Card } from '@shared/components';

interface LoanAdvantageItem {
  title: string;
  description: string;
}

@Component({
  selector: 'cf-loan-detail',
  imports: [CardAdvantage, ProductInfo, CalculatorForm, CalculatorResult, ProductAcception, Card],
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
