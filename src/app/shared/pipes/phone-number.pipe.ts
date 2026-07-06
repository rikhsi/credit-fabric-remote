import { Pipe, PipeTransform } from '@angular/core';
import { formatPhoneNumber } from '@shared/utils/phone';

@Pipe({
  name: 'phoneNumber',
})
export class PhoneNumberPipe implements PipeTransform {
  transform(value: unknown, hidden: boolean = false): string {
    return formatPhoneNumber(value, hidden);
  }
}
