import { Pipe, PipeTransform } from '@angular/core';
import { FinanceMonthSlot, getFinanceMonthDateBySlot } from '../utils/finance-months';

@Pipe({
  name: 'financeMonth',
  standalone: true,
})
export class FinanceMonthPipe implements PipeTransform {
  transform(slot: FinanceMonthSlot): Date {
    const date = getFinanceMonthDateBySlot(slot);

    return date;
  }
}
