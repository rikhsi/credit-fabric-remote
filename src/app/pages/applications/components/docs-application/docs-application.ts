import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { Router } from '@angular/router';
import { DatePipe, LowerCasePipe } from '@angular/common';
import { NzTagComponent } from 'ng-zorro-antd/tag';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { DocumentItem } from '@api/models/los/application';
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

  docs = input<DocumentItem[]>([]);
  status = input<string>();

  openDocument(documentId: number): void {
    void this.router.navigate(['/', 'document', documentId]);
  }
}
