import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { SigningDocumentsService } from '../../services';
import { toDocumentCard } from '../../utils';
import { ApplicationStatus } from '@api/models/los/application';
import { RootRoute } from '@app/constants/route-path';
import { DocsApplication } from '@pages/applications/components';
import { Empty } from '@shared/components';
import { BounceDirective } from '@shared/directives';
import { EmptyListPipe } from '@shared/pipes';

@Component({
  selector: 'cf-documents-list',
  imports: [
    TranslocoDirective,
    NzSkeletonModule,
    NzIconDirective,
    NzButtonComponent,
    EmptyListPipe,
    Empty,
    DocsApplication,
    BounceDirective,
  ],
  templateUrl: './documents-list.html',
  styleUrl: './documents-list.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentsList implements OnInit {
  private readonly signingDocumentsService = inject(SigningDocumentsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  /** Docs card shows the "sign the documents" header for this status. */
  readonly signingStatus = ApplicationStatus.OnDesign;

  readonly isLoading = computed(() => this.signingDocumentsService.isLoading());
  readonly groups = computed(() =>
    this.signingDocumentsService.applications().map((application) => ({
      applicationId: application.applicationId,
      applicationNumber: application.applicationNumber,
      docs: application.documents.map(toDocumentCard),
    })),
  );

  ngOnInit(): void {
    this.signingDocumentsService.getSigningDocuments$().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  goToApplication(applicationId: string): void {
    void this.router.navigate(['/', RootRoute.Applications, applicationId]);
  }

  goToApplications(): void {
    void this.router.navigate(['/', RootRoute.Applications]);
  }
}
