import { inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { SignedDocumentApiService } from '@api/controllers/los';
import { OnlineSigningResultPayload, SigningDocumentItem, SigningDocumentsApplication } from '@api/models/los/signing-document';

@Injectable()
export class SigningDocumentsService {
  private readonly api = inject(SignedDocumentApiService);

  public readonly isLoading = signal<boolean>(true);
  public readonly applications = signal<SigningDocumentsApplication[]>([]);

  private loaded = false;

  public getSigningDocuments$(): Observable<SigningDocumentsApplication[]> {
    this.isLoading.set(true);

    return this.api.getSigningDocuments$().pipe(
      map((result) => result.applications ?? []),
      tap((applications) => {
        this.applications.set(applications);
        this.loaded = true;
        this.isLoading.set(false);
      }),
      catchError(() => {
        this.applications.set([]);
        this.isLoading.set(false);

        return of<SigningDocumentsApplication[]>([]);
      }),
    );
  }

  /** Detail opened directly (hard reload / deep link) — load the list once to resolve document meta. */
  public ensureLoaded$(): Observable<SigningDocumentsApplication[]> {
    return this.loaded ? of(this.applications()) : this.getSigningDocuments$();
  }

  public findDocument(applicationId: string, documentId: string): SigningDocumentItem | null {
    const application = this.applications().find((item) => item.applicationId === applicationId);

    return application?.documents.find((item) => item.documentId === documentId) ?? null;
  }

  public getContent$(applicationId: string, documentId: string) {
    return this.api.getSigningDocumentContent$(applicationId, documentId);
  }

  public sendSigningResult$(applicationId: string, documentId: string, payload: OnlineSigningResultPayload) {
    return this.api
      .sendOnlineSigningResult$(applicationId, documentId, payload)
      .pipe(tap(() => this.removeDocument(applicationId, documentId)));
  }

  private removeDocument(applicationId: string, documentId: string): void {
    this.applications.update((applications) =>
      applications
        .map((application) =>
          application.applicationId === applicationId
            ? { ...application, documents: application.documents.filter((item) => item.documentId !== documentId) }
            : application,
        )
        .filter((application) => application.documents.length > 0),
    );
  }
}
