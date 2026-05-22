import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { RouterLink } from '@angular/router';
import { DatePipe, LowerCasePipe } from '@angular/common';
import { NzTagComponent } from 'ng-zorro-antd/tag';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { ApplicationStatus, DocumentItem } from '@api/models/los/application';

@Component({
  selector: 'cf-docs-application',
  imports: [RouterLink, TranslocoDirective, NzTagComponent, NzIconDirective, DatePipe, LowerCasePipe, NzButtonComponent],
  templateUrl: './docs-application.html',
  styleUrl: './docs-application.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocsApplication {
  docs = input<DocumentItem[]>([]);
  status = input<ApplicationStatus>();
}
