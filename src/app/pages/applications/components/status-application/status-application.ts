import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NzIconDirective } from 'ng-zorro-antd/icon';

@Component({
  selector: 'cf-status-application',
  imports: [NzIconDirective],
  templateUrl: './status-application.html',
  styleUrl: './status-application.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusApplication {
  status = input<string>();
}
