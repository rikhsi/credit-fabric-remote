import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { Card, Step } from '@shared/components';
import { StepItem } from '@typings';

@Component({
  selector: 'cf-layout-header',
  imports: [Card, TranslocoDirective, NzIconDirective, NzButtonComponent, Step],
  templateUrl: './layout-header.html',
  styleUrl: './layout-header.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutHeader {
  title = input<string>();
  showStep = input<boolean>(false);

  steps = input<readonly StepItem[]>([]);
}
