import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogClose} from "@angular/material/dialog";
import { MatDivider } from "@angular/material/divider";
import { NgOptimizedImage } from "@angular/common";
import { NgxMaskPipe } from "ngx-mask";
import { RouterLinkActive } from "@angular/router";
import {Loan} from "../../models/loan.model";

@Component({
  selector: 'app-loan-terms',
  imports: [
    MatDialogClose,
    MatDivider,
    NgOptimizedImage,
    NgxMaskPipe,
    RouterLinkActive
  ],
  templateUrl: './loan-terms.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoanTermsComponent{
  public loan:Loan = inject(MAT_DIALOG_DATA)

  tabs = [
      {label: 'Описание', value: 0},
      // {label: 'Тарифы по операциям', value: 1},
    ];

    activeTab = 0;

  integerPart(balance): string {
    const separator = balance.scale === 3 ? 1000 : balance.scale === 2 ? 100 : balance.scale === 1 ? 10 : 1;
    const amount = (balance.amount ?? 0) / separator;
    const [int] = amount.toFixed(2).split('.');
    return Number(int).toLocaleString().replace(/,/g, ' ');
  }
  decimalPart(balance): string {
    const separator = balance.scale === 3 ? 1000 : balance.scale === 2 ? 100 : balance.scale === 1 ? 10 : 1;
    const amount = (balance.amount ?? 0) / separator;
    const [, dec] = amount.toFixed(2).split('.');
    return dec;
  }

}
