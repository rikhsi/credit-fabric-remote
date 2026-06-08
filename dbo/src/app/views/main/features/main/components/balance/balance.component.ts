import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, DestroyRef,
  EventEmitter, input,
  Input, OnChanges,
  Output, SimpleChanges
} from '@angular/core';
import {
  AccountsPaymentsService
} from '../../../accounts-payments/services/accounts-payments.service';
import { NgxMaskPipe } from 'ngx-mask';
import {UiSvgIconComponent} from "../../../../../../core/components/ui-svg-icon/ui-svg-icon.components";
import {MatRipple} from "@angular/material/core";
import { QuickAction } from '../../../../../../shared/interfaces/quick-action.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {NgIf} from "@angular/common";
import {TotalBalanceResponse} from "../../interfaces/balance-accounts.interface";

@Component({
    selector: 'app-balance',
  imports: [
    NgxMaskPipe,
    MatRipple,
  ],
    templateUrl: './balance.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BalanceComponent implements OnChanges {
  balances: any[] = [];
  balanceUZS = {
    amount: 0,
    scale: 2,
    currency: ''
  };

  accountPrefixes: string[] = [];

  @Input() balanceSettings!: QuickAction[];

  @Output() onSettings = new EventEmitter();
  @Input() balanceDataRUB!: any;
  @Input() balanceDataEUR!: any;
  @Input() balanceDataUSD!: any;
  @Input() balanceDataCHF!: any;
  @Input() balanceDataGBP!: any;
  balanceData = input<TotalBalanceResponse | null>(null);
  constructor(
    private accountsPayment: AccountsPaymentsService,
    private _cdRef: ChangeDetectorRef,
    private destroyRef: DestroyRef,
  ) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes['balanceSettings'] && changes['balanceSettings'].currentValue != undefined) {
      this.balanceSettings = changes['balanceSettings'].currentValue;
      this.getQuery();
      if(this.balanceSettings.length > 0) {
        this.getTotalBalances();
      }
    }
  }

  getQuery() {
    this.accountPrefixes = [];
    if(this.balanceSettings?.length) {
      this.balanceSettings.forEach((balanceSetting) => {
        if(balanceSetting.visible) {
          if(balanceSetting.enum) {
            this.accountPrefixes.push(balanceSetting.enum);
          }
        }
      });
    }
  }

  // getTotalBalanceUZS() {
  //   const currency = '000';
  //   let q = `?currency=${currency}`;
  //   if(this.accountPrefixes.length) {
  //     q += `&accountPrefixes=${this.accountPrefixes.toString()}`
  //   }
  //   this.accountsPayment.getTotalBalance(q).subscribe(
  //     (balanceData: any) => {
  //       const res = balanceData?.find((el: any) => el.currency == 'UZS');
  //       if(res) {
  //         this.balanceUZS.amount = res.amount;
  //         this.balanceUZS.scale = res.scale;
  //         this.balanceUZS.currency = res.currency;
  //         this._cdRef.detectChanges();
  //       }
  //     }
  //   );
  // }

  getTotalBalances(): void {
    let q = '';
    if(this.accountPrefixes.length) {
      q += `?accountPrefixes=${this.accountPrefixes.toString()}`
    }
    this.accountsPayment.getTotalBalance(q)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
      (balanceData: any) => {
        const findUZS = balanceData?.find((el: any) => el.currency === 'UZS');

        if(findUZS) {
          this.balanceUZS = findUZS;
        }

        this.balances = balanceData
          ?.filter((el: any) => (el.currency != 'UZS')).sort((a: any, b: any) => {
          const priority = { USD: 1, EUR: 2 };
          return (priority[a.currency] || 99) - (priority[b.currency] || 99);
        });

        this._cdRef.detectChanges();
      }
    );
  }

  protected readonly Math = Math;
}
