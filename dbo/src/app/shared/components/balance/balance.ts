// Angular
import { NgxMaskPipe } from "ngx-mask";
import { NgClass, NgForOf, NgIf } from "@angular/common";
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatMenu, MatMenuItem, MatMenuTrigger } from "@angular/material/menu";



//  Model
import { Balance } from "src/app/core/models/backend-response.model";
import { UiSvgIconComponent } from "src/app/core/components/ui-svg-icon/ui-svg-icon.components";




@Component({
  selector: 'Balance',
  imports: [
    NgxMaskPipe,
    NgIf,
    NgClass,
    NgForOf,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    UiSvgIconComponent,
  ],

  templateUrl: './balance.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})


export class BalanceComponent {

  // Inputs (Come form Parant)
  isHideTitleCurrency = input<boolean>(false)
  isSingleCurrency = input<boolean>(false)
  globalHideBalance = input<boolean>(false);
  title = input<string>("Общий баланс в");
  balance = input<Balance | null>({ amount: 0, currency: "UZS", scale: 2 })


  // Outputs (Sent to Parent)
  toggleGlobal = output<void>()
  changeCurrency = output<string>()


  // Variables
  protected selectedCurrency: any = { code: 'UZS', flag: './assets/new-icons/uzb.svg' };
  protected isOpen = false;


  protected currencies = [
    { code: 'UZS', flag: './assets/new-icons/uzb.svg' },
    { code: 'USD', flag: './assets/svg/USD.svg' },
    { code: 'RUB', flag: './assets/svg/RUB.svg' },
    { code: 'EUR', flag: './assets/svg/EUR.svg' },
    { code: 'JPY', flag: './assets/flags/radius-20/JPY.png' },
    { code: 'GBP', flag: './assets/flags/radius-20/GBP.png' },
    { code: 'CHF', flag: './assets/flags/radius-20/CHF.png' },
    { code: 'CNY', flag: './assets/flags/radius-20/CNY.png' },
    { code: 'KZT', flag: './assets/flags/radius-20/KZT.png' },
  ]


  // Funtions

  protected onToggleGlobal() {
    this.toggleGlobal.emit();
  }

  protected toggleMenu() {
    this.isOpen = !this.isOpen;
  }

  protected selectCurrency(c: any) {
    this.selectedCurrency = c;
    this.isOpen = false;
    this.changeCurrency.emit(c.code);
  }

  get formattedBalance() {
    const raw = (this.balance()?.amount ?? 0) / 100;
    const [integer, decimal] = raw.toFixed(2).split(".");
    return {
      integer: integer,
      decimal,
    };
  }

  protected Math = Math
}
