import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NzTagComponent } from 'ng-zorro-antd/tag';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { TranslocoDirective } from '@jsverse/transloco';
import { ApplicationStatus } from '@api/models/los/application';

@Component({
  selector: 'cf-comment-application',
  imports: [TranslocoDirective, NzTagComponent, NzIconDirective],
  templateUrl: './comment-application.html',
  styleUrl: './comment-application.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommentApplication {
  status = input<ApplicationStatus>();
}
