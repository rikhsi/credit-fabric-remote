import { Pipe, PipeTransform } from '@angular/core';
import { ValidationErrorData } from '@typings';

@Pipe({
  name: 'validationMsg',
})
export class ValidationMsgPipe implements PipeTransform {
  transform(value: ValidationErrorData, dirty: boolean = false): string {
    console.log(dirty);
    if (dirty) {
      return value?.message ?? `validation.error.${value?.kind}`;
    }

    return null;
  }
}
