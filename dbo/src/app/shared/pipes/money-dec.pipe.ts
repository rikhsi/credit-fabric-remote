import { Pipe, PipeTransform } from '@angular/core';

type MoneyMode = 'cent' | 'amount';


@Pipe({
  name: 'moneyDec',
  standalone:true
})
export class MoneyDecPipe implements PipeTransform {

  transform(
    balance: number | null,
    mode: MoneyMode = 'cent'
  ): string {
    const amount =
      mode === 'cent'
        ? (balance ?? 0) / 100
        : (balance ?? 0);

    const [, dec] = amount.toFixed(2).split('.');
    return dec;
  }

}
