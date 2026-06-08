import { Pipe, PipeTransform } from '@angular/core';
export type MoneyMode = 'cent' | 'amount';

@Pipe({
  name: 'moneyInt',
    standalone:true
})
export class MoneyIntPipe implements PipeTransform {

 transform(
    balance: number | null,
    mode: MoneyMode = 'cent'
  ): string {
    const amount =
      mode === 'cent'
        ? (balance ?? 0) / 100
        : (balance ?? 0);

    const [int] = amount.toFixed(2).split('.');
    return Number(int)
      .toLocaleString('ru-RU')
      .replace(/,/g, ' ');
  }

}
