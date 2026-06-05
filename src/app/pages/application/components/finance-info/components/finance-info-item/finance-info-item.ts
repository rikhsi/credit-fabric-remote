import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { Card } from '@shared/components';
import { HandbookDirective } from '@shared/directives';
import { HandbookPipe } from '@shared/pipes';
import { isFlowFinanceFilled } from '@pages/application/utils/finance';
import { OnlineStartProcessingFinData } from '@api/models/los/online';

@Component({
  selector: 'cf-finance-info-item',
  imports: [Card, NzButtonComponent, NzIconDirective, NzTypographyComponent, HandbookDirective, HandbookPipe],
  templateUrl: './finance-info-item.html',
  styleUrl: './finance-info-item.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinanceInfoItem {
  readonly item = input.required<OnlineStartProcessingFinData>();

  readonly edit = output<void>();

  readonly isFilled = computed(() => isFlowFinanceFilled(this.item()));
}
