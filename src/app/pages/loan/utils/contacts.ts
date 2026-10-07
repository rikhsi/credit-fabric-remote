import { ValidationError } from '@angular/forms/signals';
import { StartProcessingContact } from '@api/models/los/start-processing';
import { toUzFullPhoneDigits } from '@shared/utils/phone';

/** Letters (any script), spaces, hyphen and apostrophe only. */
export const PERSON_NAME_PATTERN = /^[\p{L}\s'-]+$/u;

export function createEmptyContact(): StartProcessingContact {
  return {
    firstName: '',
    lastName: '',
    mobilePhone: '',
    dirFamilyRelationshipId: '',
  };
}

export function isPersonNameValid(value: unknown): boolean {
  const raw = String(value ?? '').trim();

  return raw !== '' && PERSON_NAME_PATTERN.test(raw);
}

export function validatePersonName(value: unknown): ValidationError | null {
  const raw = String(value ?? '').trim();

  if (!raw) {
    return null;
  }

  return isPersonNameValid(raw) ? null : { kind: 'personName', message: 'validation.error.personName' };
}

export function isContactFilled(contact: StartProcessingContact | null | undefined): boolean {
  if (!contact) {
    return false;
  }

  return (
    isPersonNameValid(contact.firstName) &&
    isPersonNameValid(contact.lastName) &&
    toUzFullPhoneDigits(contact.mobilePhone) != null &&
    String(contact.dirFamilyRelationshipId ?? '').trim() !== ''
  );
}

export function isContactsFilled(contacts: StartProcessingContact[] | null | undefined): boolean {
  return Array.isArray(contacts) && contacts.length > 0 && contacts.every(isContactFilled);
}

export function normalizeContactForApi(contact: StartProcessingContact): StartProcessingContact {
  return {
    firstName: contact.firstName.trim(),
    lastName: contact.lastName.trim(),
    mobilePhone: toUzFullPhoneDigits(contact.mobilePhone) ?? '',
    dirFamilyRelationshipId: String(contact.dirFamilyRelationshipId ?? ''),
  };
}

export function normalizeContactsForApi(contacts: StartProcessingContact[]): StartProcessingContact[] {
  return contacts.map(normalizeContactForApi);
}

export function contactFullName(contact: StartProcessingContact): string {
  return [contact.firstName, contact.lastName].map((part) => part.trim()).filter(Boolean).join(' ');
}
