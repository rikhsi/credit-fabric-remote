import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, Observable, throwError } from 'rxjs';
import { MOCK_DELAY_MS, mockOf } from './mock-delay';
import { MOCK_SIGNING_DOCUMENT_CONTENT_BASE64, MOCK_SIGNING_DOCUMENTS } from './signing-documents.mock';
import {
  OnlineSigningResultPayload,
  OnlineSigningResultResult,
  SigningDocumentContentResult,
  SigningDocumentsResult,
} from '@api/models/los/signing-document';

@Injectable()
export class MockSignedDocumentApiService {
  public getSigningDocuments$(): Observable<SigningDocumentsResult> {
    return mockOf(MOCK_SIGNING_DOCUMENTS);
  }

  public getSigningDocumentContent$(applicationId: string, documentId: string): Observable<SigningDocumentContentResult> {
    const application = MOCK_SIGNING_DOCUMENTS.applications.find((item) => item.applicationId === applicationId);
    const document = application?.documents.find((item) => item.documentId === documentId);

    if (!document) {
      return throwError(
        () =>
          new HttpErrorResponse({
            status: 404,
            statusText: 'Not Found',
            error: { message: `Mock signing document ${documentId} not found` },
          }),
      ).pipe(delay(MOCK_DELAY_MS));
    }

    return mockOf({
      code: '0',
      contentBase64: MOCK_SIGNING_DOCUMENT_CONTENT_BASE64,
      documentId,
      message: 'OK',
      requestId: `mock-content-${documentId}`,
    });
  }

  public sendOnlineSigningResult$(
    applicationId: string,
    documentId: string,
    payload: OnlineSigningResultPayload,
  ): Observable<OnlineSigningResultResult> {
    // Signed document leaves the "to sign" list; drop empty applications as well.
    MOCK_SIGNING_DOCUMENTS.applications = MOCK_SIGNING_DOCUMENTS.applications
      .map((application) =>
        application.applicationId === applicationId
          ? { ...application, documents: application.documents.filter((item) => item.documentId !== documentId) }
          : application,
      )
      .filter((application) => application.documents.length > 0);

    return mockOf({
      code: '0',
      message: 'Signed document stored (mock)',
      requestId: `mock-signing-result-${documentId}`,
      status: payload.status,
      storedAt: new Date().toISOString(),
    });
  }
}
