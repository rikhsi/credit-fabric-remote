import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'minorToMajor',
  standalone:true
})
export class MinorToMajorPipe implements PipeTransform {

  transform(value: number, scale: number): { int: string, dec: string } {
    const scaledValue = (value / Math.pow(10, scale)).toFixed(2);
    const data = scaledValue.split('.');
    return {
      int: data[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' '),
      dec: `.${data[1]}`
    };
  }

}
