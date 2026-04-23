import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'monthsToYears',
  standalone: true,
})
export class MonthsToYearsPipe implements PipeTransform {
  transform(months: number | null | undefined): number {
    if (!months) return 0;
    return Math.floor(months / 12);
  }
}
