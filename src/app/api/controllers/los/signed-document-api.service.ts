import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  OnlineSigningResultPayload,
  OnlineSigningResultResult,
  SigningDocumentContentResult,
  SigningDocumentsResult,
} from '@api/models/los/signing-document';

@Injectable({
  providedIn: 'root',
})
export class SignedDocumentApiService {
  constructor(private http: HttpClient) {}

  public getSigningDocuments$(): Observable<SigningDocumentsResult> {
    return this.http.get<SigningDocumentsResult>('credit-applications/signing-documents');
  }

  public getSigningDocumentContent$(applicationId: string, documentId: string): Observable<SigningDocumentContentResult> {
    return this.http.get<SigningDocumentContentResult>(`credit-applications/${applicationId}/signing-documents/${documentId}/content`);
  }

  public sendOnlineSigningResult$(
    applicationId: string,
    documentId: string,
    payload: OnlineSigningResultPayload,
  ): Observable<OnlineSigningResultResult> {
    return this.http.post<OnlineSigningResultResult>(
      `credit-applications/${applicationId}/documents/${documentId}/online-signing-results`,
      payload,
    );
  }
}
