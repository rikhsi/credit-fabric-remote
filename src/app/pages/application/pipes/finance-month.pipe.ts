import { DatePipe } from '@angular/common';
import { inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import { FinanceMonthSlot, getFinanceMonthDateBySlot } from '../utils/finance-months';

@Pipe({
  name: 'financeMonth',
  standalone: true,
})
export class FinanceMonthPipe implements PipeTransform {
  private readonly locale = inject(LOCALE_ID);
  private readonly datePipe = new DatePipe(this.locale);

  transform(slot: FinanceMonthSlot, format = 'MMMM y', timezone?: string, locale?: string): string {
    const date = getFinanceMonthDateBySlot(slot);

    return this.datePipe.transform(date, format, timezone, locale ?? this.locale) ?? '';
  }
}
