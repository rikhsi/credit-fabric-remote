import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { Card } from '@shared/components';
import { HandbookDirective } from '@shared/directives';
import { HandbookPipe, PluralizePipe } from '@shared/pipes';
import { FinanceMonthPipe } from '@pages/loan/pipes';
import { parseFinanceAmount } from '@pages/loan/utils/finance-months';
import { OnlineStartProcessingFinData } from '@api/models/los/start-processing';

@Component({
  selector: 'cf-finance-info-item',
  imports: [Card, NzTypographyComponent, HandbookDirective, HandbookPipe, PluralizePipe, FinanceMonthPipe, DatePipe, DecimalPipe],
  templateUrl: './finance-info-item.html',
  styleUrl: './finance-info-item.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinanceInfoItem {
  readonly item = input.required<OnlineStartProcessingFinData>();

  amount(value: unknown): number {
    return parseFinanceAmount(value);
  }
}
