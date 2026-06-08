import {
  ChangeDetectionStrategy,
  Component,
  input,
  OnChanges,
  output,
  SimpleChanges
} from '@angular/core';
import { Balance } from "../../../../../../core/models/backend-response.model";
import { NgClass, NgForOf, NgIf } from "@angular/common";
import { MatMenu, MatMenuItem } from "@angular/material/menu";
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-balance',
  imports: [
    NgIf,
    MatMenu,
    MatMenuItem,
    NgClass,
    NgForOf,
    TranslateModule
  ],
  templateUrl: './balance.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BalanceComponent implements OnChanges {
  title= input<string>('')
  isNegativeBalance = input<boolean>()
  isEyeIconVisible = input<boolean>(true)
  balance = input<Balance | null>(null)
  tab = input<any>(null)
  globalHideBalance = input<boolean>(false);
  isFlagsVisibleInSelectedCurrency = input<boolean>(true)
  toggleGlobal = output<void>()
  currencyList = input<Array<{ code: string; flag: string }>>([])
  changeCurrency = output<string>()

Number = Number
  onToggleGlobal() {
    this.toggleGlobal.emit();
  }
  selectedCurrency: any = { code: 'UZS', flag: './assets/new-icons/uzb.svg' };
  isOpen = false;

  // currencies = [
  //   { code: 'UZS', flag: './assets/new-icons/uzb.svg' },
  //   { code: 'USD', flag: './assets/svg/USD.svg' },
  //   { code: 'RUB', flag: './assets/svg/RUB.svg' },
  //   { code: 'EUR', flag: './assets/svg/EUR.svg' },
  //   { code: 'JPY', flag: './assets/flags/radius-20/JPY.png' },
  //   { code: 'GBP', flag: './assets/flags/radius-20/GBP.png' },
  //   { code: 'CHF', flag: './assets/flags/radius-20/CHF.png' },
  //   { code: 'CNY', flag: './assets/flags/radius-20/CNY.png' },
  //   { code: 'KZT', flag: './assets/flags/radius-20/KZT.png' },
  // ]

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['balance'] && this.balance()) {
    }
  }

  toggleMenu() {
    this.isOpen = !this.isOpen;
  }

  get integerPart(): string {
    const amount = (this.balance()?.amount ?? 0) / 100;
    const [int] = amount.toFixed(2).split('.');
    return Number(int).toLocaleString().replace(/,/g, ' ');
  }

  get decimalPart(): string {
    const amount = (this.balance()?.amount ?? 0) / 100;
    const [, dec] = amount.toFixed(2).split('.');
    return dec;
  }

  checkUrl() {
    return window.location.pathname === '/main';
  }

  selectCurrency(c: any) {
    this.selectedCurrency = c;
    this.isOpen = false;
    this.changeCurrency.emit(c.code);
  }
}
