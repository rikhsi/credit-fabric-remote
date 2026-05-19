import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { ApplicationStatus } from '@api/models/los';

@Component({
  selector: 'cf-action-application',
  imports: [NzButtonComponent, TranslocoDirective],
  templateUrl: './action-application.html',
  styleUrl: './action-application.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionApplication {
  status = input<ApplicationStatus>();
  disabled = input<boolean>();

  declined = output<void>();
  approved = output<void>();
}
