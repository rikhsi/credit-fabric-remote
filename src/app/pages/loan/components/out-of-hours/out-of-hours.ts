import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { formatWorkingHours } from '@shared/utils';

@Component({
  selector: 'cf-out-of-hours',
  imports: [TranslocoDirective, NzIconDirective, NzTypographyComponent],
  templateUrl: './out-of-hours.html',
  styleUrl: './out-of-hours.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OutOfHours {
  protected readonly hours = formatWorkingHours();
}
