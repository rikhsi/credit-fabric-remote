import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phoneNumber',
})
export class PhoneNumberPipe implements PipeTransform {
  transform(value: unknown): string {
    if (!value) return '';

    const digits = String(value).replace(/\D/g, '');

    if (digits.length !== 12) return value as string;

    const country = digits.slice(0, 3); // 998
    const operator = digits.slice(3, 5); // 99
    const part1 = digits.slice(5, 8); // 003
    const part2 = digits.slice(8, 10); // 14
    const part3 = digits.slice(10, 12); // 97

    return `+${country} (${operator}) ${part1}-${part2}-${part3}`;
  }
}
