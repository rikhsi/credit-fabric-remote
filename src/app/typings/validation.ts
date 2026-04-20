import { ValidationError } from '@angular/forms/signals';

export type ValidationErrorType = 'required' | 'minLength' | 'maxLength' | 'email' | 'invalidOtp';

export type ValidationErrorData = ValidationError & { [key in ValidationErrorType]: number };
