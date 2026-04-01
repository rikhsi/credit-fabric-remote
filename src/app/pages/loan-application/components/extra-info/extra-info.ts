import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { Card } from '@shared/components';

@Component({
  selector: 'cf-extra-info',
  imports: [NzButtonComponent, NzIconDirective, Card],
  templateUrl: './extra-info.html',
  styleUrl: './extra-info.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExtraInfo {
  readonly add = output<void>();
  readonly edit = output<void>();
}
