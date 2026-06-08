import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'expiryDate'
})
export class ExpiryDatePipe implements PipeTransform {
  transform(value: string): string {
    return `${value.slice(0, 2)}/${value.slice(2)}`;
  }
}
