import { StartProcessingContact } from '@api/models/los/start-processing';

export interface ContactFormData {
  contact?: StartProcessingContact | null;
  /** When set, modal updates an existing contact; otherwise it adds a new one. */
  index?: number | null;
}
