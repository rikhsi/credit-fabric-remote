import { ValidationError } from '@angular/forms/signals';
import { StartProcessingAddress } from '@api/models/los/start-processing';

/** Uzbekistan postal index is 6 digits. */
export const ZIP_CODE_PATTERN = /^\d{6}$/;

export function createEmptyAddress(): StartProcessingAddress {
  return {
    dirCountryId: 'UZB',
    dirCityId: null,
    dirVillageId: null,
    street: null,
    zipCode: null,
  };
}

export function isZipCodeValid(value: unknown): boolean {
  return ZIP_CODE_PATTERN.test(String(value ?? '').trim());
}

export function validateZipCode(value: unknown): ValidationError | null {
  const raw = String(value ?? '').trim();

  if (!raw) {
    return null;
  }

  return isZipCodeValid(raw) ? null : { kind: 'zipCode', message: 'validation.error.zipCode' };
}

export function isFlowAddressFilled(item: StartProcessingAddress | null | undefined): boolean {
  return (
    item != null &&
    item.dirCityId != null &&
    String(item.dirCityId).trim() !== '' &&
    item.dirVillageId != null &&
    String(item.dirVillageId).trim() !== '' &&
    item.street != null &&
    String(item.street).trim() !== ''
  );
}
