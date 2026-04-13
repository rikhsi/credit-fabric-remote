import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { Card } from '@shared/components';

@Component({
  selector: 'cf-extra-info',
  imports: [Card, NzButtonComponent, NzIconDirective, NzTypographyComponent, TranslocoDirective],
  templateUrl: './extra-info.html',
  styleUrl: './extra-info.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExtraInfo {
  readonly add = output<void>();
  readonly edit = output<void>();
}
