import { ValidationErrorData } from '@typings';

export function errorCountBuilder(error: ValidationErrorData): number | null {
  switch (error?.kind) {
    case 'minLength':
      return error.minLength ?? null;
    case 'maxLength':
      return error.maxLength ?? null;
    default:
      return null;
  }
}
