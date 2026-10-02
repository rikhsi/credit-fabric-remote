import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { TranslocoDirective } from '@jsverse/transloco';
import { ApplicationStatusPipe } from '@pages/applications/pipes';
import { normalizeApplicationStatus } from '@api/utils';

@Component({
  selector: 'cf-status-application',
  imports: [NzIconDirective, ApplicationStatusPipe, TranslocoDirective],
  templateUrl: './status-application.html',
  styleUrl: './status-application.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusApplication {
  status = input<string>();

  readonly normalizedStatus = computed(() => normalizeApplicationStatus(this.status()) ?? this.status());
}
