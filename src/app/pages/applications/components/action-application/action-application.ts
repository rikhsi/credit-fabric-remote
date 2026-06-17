import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { BounceDirective } from '@shared/directives';

@Component({
  selector: 'cf-action-application',
  imports: [NzButtonComponent, TranslocoDirective, BounceDirective],
  templateUrl: './action-application.html',
  styleUrl: './action-application.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionApplication {
  goToApplication = output<void>();
}
