import { SigningDocumentItem } from '@api/models/los/signing-document';
import { DocumentCardItem } from '@app/typings/document';

export function toDocumentCard(document: SigningDocumentItem): DocumentCardItem {
  return {
    id: document.documentId,
    type: document.documentType,
    title: document.documentName,
    isSigned: false,
    createdDate: null,
    signedDate: null,
  };
}
