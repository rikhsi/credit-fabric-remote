import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NzTagComponent } from 'ng-zorro-antd/tag';
import { TranslocoDirective } from '@jsverse/transloco';
import { ApplicationStatus } from '@api/models/los/application';

@Component({
  selector: 'cf-tag-application',
  imports: [NzTagComponent, TranslocoDirective],
  templateUrl: './tag-application.html',
  styleUrl: './tag-application.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagApplication {
  status = input<ApplicationStatus>();
}
