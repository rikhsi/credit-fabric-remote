import {ChangeDetectionStrategy, Component, inject, signal,} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {UiSvgIconComponent} from 'src/app/core/components/ui-svg-icon/ui-svg-icon.components';
import {MatTabsModule} from '@angular/material/tabs';
import {MatTableModule} from '@angular/material/table';
import {MatRippleModule} from '@angular/material/core';
import {MAT_DIALOG_DATA, MatDialogClose} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';
import {MyDepositsDto} from "../../../models/deposits.model";
import {MatIconButton} from "@angular/material/button";
import {NgxMaskPipe} from "ngx-mask";
import {RouterLink} from "@angular/router";
import {MatTooltip} from "@angular/material/tooltip";
import { AmountService } from '../../../../../../../core/services/amount.service';

export interface PeriodicElement {
  month: number;
  payment: string;
  percent: string;
  mainDebt: string;
  remainingDebt: string;
  paymentDate: string;
  currency: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {
    month: 1,
    payment: '818 309 374.66 ',
    percent: '1 690 625.34',
    mainDebt: '16 331 666.67',
    remainingDebt: '818 309 374.66',
    paymentDate: '04.08.2023 г',
    currency: 'UZS',
  },
  {
    month: 2,
    payment: '818 309 374.66 ',
    percent: '1 690 625.34',
    mainDebt: '16 331 666.67',
    remainingDebt: '818 309 374.66',
    paymentDate: '04.08.2023 г',
    currency: 'UZS',
  },
  {
    month: 3,
    payment: '818 309 374.66 ',
    percent: '1 690 625.34',
    mainDebt: '16 331 666.67',
    remainingDebt: '818 309 374.66',
    paymentDate: '04.08.2023 г',
    currency: 'UZS',
  },
  {
    month: 4,
    payment: '818 309 374.66 ',
    percent: '1 690 625.34',
    mainDebt: '16 331 666.67',
    remainingDebt: '818 309 374.66',
    paymentDate: '04.08.2023 г',
    currency: 'UZS',
  },
  {
    month: 5,
    payment: '818 309 374.66 ',
    percent: '1 690 625.34',
    mainDebt: '16 331 666.67',
    remainingDebt: '818 309 374.66',
    paymentDate: '04.08.2023 г',
    currency: 'UZS',
  },
  {
    month: 6,
    payment: '818 309 374.66 ',
    percent: '1 690 625.34',
    mainDebt: '16 331 666.67',
    remainingDebt: '818 309 374.66',
    paymentDate: '04.08.2023 г',
    currency: 'UZS',
  },
  {
    month: 7,
    payment: '818 309 374.66 ',
    percent: '1 690 625.34',
    mainDebt: '16 331 666.67',
    remainingDebt: '818 309 374.66',
    paymentDate: '04.08.2023 г',
    currency: 'UZS',
  },
  {
    month: 8,
    payment: '818 309 374.66 ',
    percent: '1 690 625.34',
    mainDebt: '16 331 666.67',
    remainingDebt: '818 309 374.66',
    paymentDate: '04.08.2023 г',
    currency: 'UZS',
  },
  {
    month: 9,
    payment: '818 309 374.66 ',
    percent: '1 690 625.34',
    mainDebt: '16 331 666.67',
    remainingDebt: '818 309 374.66',
    paymentDate: '04.08.2023 г',
    currency: 'UZS',
  },
  {
    month: 10,
    payment: '818 309 374.66 ',
    percent: '1 690 625.34',
    mainDebt: '16 331 666.67',
    remainingDebt: '818 309 374.66',
    paymentDate: '04.08.2023 г',
    currency: 'UZS',
  },
  {
    month: 11,
    payment: '818 309 374.66 ',
    percent: '1 690 625.34',
    mainDebt: '16 331 666.67',
    remainingDebt: '818 309 374.66',
    paymentDate: '04.08.2023 г',
    currency: 'UZS',
  },
  {
    month: 12,
    payment: '818 309 374.66 ',
    percent: '1 690 625.34',
    mainDebt: '16 331 666.67',
    remainingDebt: '818 309 374.66',
    paymentDate: '04.08.2023 г',
    currency: 'UZS',
  },
];

@Component({
    selector: 'app-my-deposit-details',
    imports: [
        CommonModule,
        UiSvgIconComponent,
        MatTabsModule,
        MatTableModule,
        MatRippleModule,
        MatIcon,
        MatDialogClose,
        MatIconButton,
        NgOptimizedImage,
        NgxMaskPipe,
        RouterLink,
        MatTooltip,
    ],
    templateUrl: './my-deposit-details.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyDepositDetailsComponent {
  public data = signal<MyDepositsDto>(inject(MAT_DIALOG_DATA));

  constructor(
    public amountService: AmountService,
  ) {
  }

  getDigitOfDays(closingDate: string) {
    const currentDate = new Date();
    const close = this.convertToDate(closingDate);
    const timeDifference = close.getTime() - currentDate.getTime();
    return Math.ceil(timeDifference / (1000 * 60 * 60 * 24))
  }

  convertToDate(dateStr) {
    const [day, month, year] = dateStr.split('.').map(Number);
    return new Date(year, month - 1, day); // Month is 0-based
  }
}
