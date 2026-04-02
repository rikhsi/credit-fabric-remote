import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzDividerComponent } from 'ng-zorro-antd/divider';
import { Card } from '@shared/components';

@Component({
  selector: 'cf-finance-info',
  imports: [Card, NzButtonComponent, NzIconDirective, NzDividerComponent],
  templateUrl: './finance-info.html',
  styleUrl: './finance-info.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinanceInfo {
  add = output<void>();
  edit = output<void>();
}
