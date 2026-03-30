import { Pipe, PipeTransform } from '@angular/core';
import { ValidationError } from '@angular/forms/signals';
import { NzValidateStatus } from 'ng-zorro-antd/core/types';
import { VALIDATION_ERROR_STATUS } from '@constants';
import { ValidationErrorType } from '@typings';

@Pipe({
  name: 'validationStatus',
})
export class ValidationStatusPipe implements PipeTransform {
  transform(value: ValidationError, dirty: boolean = false): NzValidateStatus {
    if (dirty) {
      return VALIDATION_ERROR_STATUS[value?.kind as ValidationErrorType];
    }

    return '';
  }
}
