import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cardNumberFormat'
})
export class CardNumberFormatPipe implements PipeTransform {

  transform(value: string): string {
    return value?.replace(/(\d{4})(?=\d)/g, '$1 ') || '';
  }

}
