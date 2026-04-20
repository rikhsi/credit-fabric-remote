import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'emptyList',
})
export class EmptyListPipe implements PipeTransform {
  transform<T>(value: T[], length: number): T[] {
    if (value.length >= length) {
      return value;
    }
    return [...value, ...Array(length - value.length).fill(null)];
  }
}
