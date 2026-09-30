/** GET credit-applications/signing-documents */
export interface SigningDocumentSigner {
  pinfl: string;
  role: string;
}

export interface SigningDocumentItem {
  documentId: string;
  documentName: string;
  documentType: string;
  signers: SigningDocumentSigner[];
  signingTypes: string[];
}

export interface SigningDocumentsApplication {
  applicationId: string;
  applicationNumber: string;
  documents: SigningDocumentItem[];
}

export interface SigningDocumentsOrganization {
  inn: string;
  pinfl: string;
}

export interface SigningDocumentsResult {
  applications: SigningDocumentsApplication[];
  code: string;
  message: string;
  organization: SigningDocumentsOrganization;
  requestId: string;
}

/** GET credit-applications/{applicationId}/signing-documents/{documentId}/content */
export interface SigningDocumentContentResult {
  code: string;
  contentBase64: string;
  documentId: string;
  message: string;
  requestId: string;
}

/** POST credit-applications/{applicationId}/documents/{document_Id}/online-signing-results */
export interface OnlineSigningResultSigner {
  confirmationMethods: string;
  pinfl: string;
  role: string;
  signedAt: string;
  status: string;
}

export interface OnlineSigningResultPayload {
  completedAt: string;
  signedPdfBase64: string;
  signers: OnlineSigningResultSigner[];
  status: string;
}

export interface OnlineSigningResultResult {
  code: string;
  message: string;
  requestId: string;
  status: string;
  storedAt: string;
}
