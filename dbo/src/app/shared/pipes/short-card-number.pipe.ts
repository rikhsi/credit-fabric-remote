import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortCardNumber',
  standalone: true
})
export class ShortCardNumberPipe implements PipeTransform {

  transform(value: string | number, left: number = 5, right: number = 3, mask: string = '・・'): string {
    const str = String(value);
    if (str.length <= 9) return str;

    return `${str.slice(0, left)}${mask}${str.slice(-right)}`;
  }
}
