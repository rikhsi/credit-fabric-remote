import { ValidationError } from '@angular/forms/signals';

export type ValidationErrorType = 'required' | 'minLength' | 'maxLength' | 'email';

export type ValidationErrorData = ValidationError & { [key in ValidationErrorType]: number };
