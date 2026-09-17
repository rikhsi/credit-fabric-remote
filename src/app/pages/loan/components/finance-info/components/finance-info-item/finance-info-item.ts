import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { Card } from '@shared/components';
import { BounceDirective, HandbookDirective } from '@shared/directives';
import { HandbookPipe, PluralizePipe } from '@shared/pipes';
import { FinanceMonthPipe } from '@pages/application/pipes/finance-month.pipe';
import { parseFinanceAmount } from '@pages/application/utils/finance-months';
import { OnlineStartProcessingFinData } from '@api/models/los/start-processing';

@Component({
  selector: 'cf-finance-info-item',
  imports: [
    Card,
    NzButtonComponent,
    NzIconDirective,
    NzTypographyComponent,
    HandbookDirective,
    HandbookPipe,
    BounceDirective,
    PluralizePipe,
    FinanceMonthPipe,
    DatePipe,
    DecimalPipe,
  ],
  templateUrl: './finance-info-item.html',
  styleUrl: './finance-info-item.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinanceInfoItem {
  readonly item = input.required<OnlineStartProcessingFinData>();

  readonly edit = output<void>();

  amount(value: unknown): number {
    return parseFinanceAmount(value);
  }
}
