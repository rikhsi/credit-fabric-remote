import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'secondsToTime',
  standalone: true,
})
export class SecondsToTimePipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null || isNaN(value)) return '00:00';

    const minutes = Math.floor(value / 60);
    const seconds = value % 60;

    return `${this.pad(minutes)}:${this.pad(seconds)}`;
  }

  private pad(n: number): string {
    return n < 10 ? `0${n}` : `${n}`;
  }
}
