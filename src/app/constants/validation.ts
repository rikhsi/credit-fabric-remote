import { NzValidateStatus } from 'ng-zorro-antd/core/types';
import { ValidationErrorType } from '@app/typings/validation';

export const VALIDATION_ERROR_STATUS: Record<ValidationErrorType, NzValidateStatus> = {
  required: 'error',
  minLength: '',
  maxLength: '',
  email: 'error',
  invalidOtp: 'error',
};
