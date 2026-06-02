import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { FinanceInfoItem } from './components';
import { Card, Steps } from '@shared/components';
import { FlowFinanceForm } from '@pages/application/models/form';

@Component({
  selector: 'cf-finance-info',
  imports: [Card, NzButtonComponent, NzIconDirective, NzTypographyComponent, Steps, TranslocoDirective, FinanceInfoItem],
  templateUrl: './finance-info.html',
  styleUrl: './finance-info.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinanceInfo {
  readonly items = input<FlowFinanceForm[]>([]);

  readonly add = output<void>();
  readonly edit = output<number>();
}
