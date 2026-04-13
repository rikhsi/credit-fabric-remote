import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { Card, Steps } from '@shared/components';

@Component({
  selector: 'cf-finance-info',
  imports: [Card, NzButtonComponent, NzIconDirective, NzTypographyComponent, Steps, TranslocoDirective],
  templateUrl: './finance-info.html',
  styleUrl: './finance-info.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinanceInfo {
  add = output<void>();
  edit = output<void>();
}
