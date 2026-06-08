import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Inject, OnInit,
  signal,
  ViewEncapsulation
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {MAT_DIALOG_DATA, MatDialogClose} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { DialogRef } from '@angular/cdk/dialog';
import { UiSvgIconComponent } from '../ui-svg-icon/ui-svg-icon.components';
import {FormsModule} from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import {NgxMaskDirective} from "ngx-mask";
import {type} from "node:os";
import {code} from "../../../../assets/constants/purpose.const";
import {error} from "@angular/compiler-cli/src/transformers/util";
@Component({
    selector: 'app-calculator-modal',
    imports: [CommonModule, MatIconModule, UiSvgIconComponent, FormsModule, MatDialogClose, NgxMaskDirective],
    templateUrl: './calculator-modal.component.html',
    styles: [``],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class CalculatorModalComponent implements OnInit{
  private _cdr = inject(ChangeDetectorRef)
  supportedCurrencies = [
    { code: '000', name: 'UZS' },
    { code: '840', name: 'USD' },
    { code: '643', name: 'RUB' },
    { code: '978', name: 'EUR' },
    { code: '826', name: 'GBP' },
    { code: '156', name: 'CNY' },
  ];

  selectedFromCurrency = '000';
  selectedToCurrency = '840';
  amount: number = 1;
  convertedAmount: number = 0;
  lastUpdated: string = '';

  constructor(private http: HttpClient) {}

  selectCurrency(type: 'from' | 'to', code: string): void {
    if (type === 'from') {
      this.selectedFromCurrency = code;
      if (this.selectedFromCurrency === this.selectedToCurrency) {
        this.selectedToCurrency = this.supportedCurrencies.find(
          (currency) => currency.code !== code
        )?.code || this.selectedToCurrency;
      }
    }

    if (type === 'to') {
      this.selectedToCurrency = code;
      if (this.selectedToCurrency === this.selectedFromCurrency) {
        this.selectedFromCurrency = this.supportedCurrencies.find(
          (currency) => currency.code !== code
        )?.code || this.selectedFromCurrency;
      }
    }

    this.calculateConversion();
  }
  calculateConversion(): void {
    const apiUrl = `https://corp-api.hamkor.uz/api/v1/core/conversion/calculate-amount/by-currency`;


    const calculatedAmount = this.amount * 100;

    const params = {
      fromCurrency: this.selectedFromCurrency,
      toCurrency: this.selectedToCurrency,
      amount: calculatedAmount.toString(),
      amountCurrencyCode: this.selectedFromCurrency,
    };

    this.http.get<any>(apiUrl, { params }).subscribe(
      (response) => {
        const clientCurrencyOfferAmount = response?.result?.data?.clientCurrencyOfferAmount ;
        this.convertedAmount = clientCurrencyOfferAmount / 100;
        this.lastUpdated = new Date().toISOString();
        this._cdr.detectChanges()

      },
      (error) => {
        console.error('Error fetching conversion data:', error);
      }
    );
  }

  ngOnInit(): void {
    this.calculateConversion();
  }
}
