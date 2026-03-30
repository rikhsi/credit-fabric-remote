import { Pipe, PipeTransform } from '@angular/core';
import { ValidationErrorData } from '@typings';

@Pipe({
  name: 'validationMsg',
})
export class ValidationMsgPipe implements PipeTransform {
  transform(value: ValidationErrorData, dirty: boolean = false): string {
    if (value?.kind && dirty) {
      return value?.message ?? `validation.error.${value?.kind}`;
    }

    return null;
  }
}
