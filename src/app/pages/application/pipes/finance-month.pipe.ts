import { DatePipe } from '@angular/common';
import { inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import { toFinanceMonthDate } from '../utils/finance-months';

@Pipe({
  name: 'financeMonth',
  standalone: true,
})
export class FinanceMonthPipe implements PipeTransform {
  private readonly locale = inject(LOCALE_ID);
  private readonly datePipe = new DatePipe(this.locale);

  transform(monthId: string | null | undefined, format = 'MMMM y', timezone?: string, locale?: string): string {
    const date = toFinanceMonthDate(monthId);

    if (!date) {
      return monthId ?? '';
    }

    return this.datePipe.transform(date, format, timezone, locale ?? this.locale) ?? monthId ?? '';
  }
}
