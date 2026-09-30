/**
 * View-model for `cf-docs-application` cards.
 * `DocumentItem` (application docs) is structurally compatible; signing documents are mapped via `toDocumentCard`.
 */
export interface DocumentCardItem {
  id: number | string;
  type: string;
  isSigned: boolean;
  /** Explicit display name; falls back to the translated `type` when absent. */
  title?: string;
  createdDate?: string | null;
  signedDate?: string | null;
}
