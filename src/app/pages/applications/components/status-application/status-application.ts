import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { TranslocoDirective } from '@jsverse/transloco';
import { ApplicationStatusPipe } from '@pages/applications/pipes';
import { ApplicationStatus } from '@api/models/los/application';

@Component({
  selector: 'cf-status-application',
  imports: [NzIconDirective, ApplicationStatusPipe, TranslocoDirective],
  templateUrl: './status-application.html',
  styleUrl: './status-application.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusApplication {
  status = input<ApplicationStatus>();
}
