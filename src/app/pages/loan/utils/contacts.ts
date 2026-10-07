import { StartProcessingContact } from '@api/models/los/start-processing';
import { toUzFullPhoneDigits } from '@shared/utils/phone';

export function createEmptyContact(): StartProcessingContact {
  return {
    firstName: '',
    lastName: '',
    mobilePhone: '',
    dirFamilyRelationshipId: '',
  };
}

export function isContactFilled(contact: StartProcessingContact | null | undefined): boolean {
  if (!contact) {
    return false;
  }

  return (
    contact.firstName.trim() !== '' &&
    contact.lastName.trim() !== '' &&
    toUzFullPhoneDigits(contact.mobilePhone) != null &&
    String(contact.dirFamilyRelationshipId ?? '').trim() !== ''
  );
}

export function normalizeContactForApi(contact: StartProcessingContact): StartProcessingContact {
  return {
    firstName: contact.firstName.trim(),
    lastName: contact.lastName.trim(),
    mobilePhone: toUzFullPhoneDigits(contact.mobilePhone) ?? '',
    dirFamilyRelationshipId: String(contact.dirFamilyRelationshipId ?? ''),
  };
}
