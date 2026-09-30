import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { Router } from '@angular/router';
import { DatePipe, LowerCasePipe } from '@angular/common';
import { NzTagComponent } from 'ng-zorro-antd/tag';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { RootRoute } from '@app/constants/route-path';
import { DocumentCardItem } from '@app/typings/document';
import { BounceDirective } from '@shared/directives';

@Component({
  selector: 'cf-docs-application',
  imports: [TranslocoDirective, NzTagComponent, NzIconDirective, DatePipe, LowerCasePipe, NzButtonComponent, BounceDirective],
  templateUrl: './docs-application.html',
  styleUrl: './docs-application.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocsApplication {
  private router = inject(Router);

  docs = input<DocumentCardItem[]>([]);
  status = input<string>();
  /** Application the documents belong to — required to open the signing detail page. */
  applicationId = input.required<number | string>();

  openDocument(documentId: number | string): void {
    void this.router.navigate(['/', RootRoute.Documents, this.applicationId(), documentId], {
      queryParams: { backRoute: this.router.url },
    });
  }
}
