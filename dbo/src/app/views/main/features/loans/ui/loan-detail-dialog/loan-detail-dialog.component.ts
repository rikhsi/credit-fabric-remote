import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogClose} from "@angular/material/dialog";
import {Loan, LoanDetail} from "../../models/loan.model";
import {MatIcon} from "@angular/material/icon";
import {MatIconButton} from "@angular/material/button";
import {NgIf, NgOptimizedImage} from "@angular/common";
import {MatTooltip} from "@angular/material/tooltip";
import {NgxMaskPipe} from "ngx-mask";
import { RouterLink } from '@angular/router';
import { AmountService } from '../../../../../../core/services/amount.service';
import { Options, TemplateService } from '../../../../../../core/services/template.service';
import { LoanService } from '../../services/loan.service';
import { MatDivider } from "@angular/material/divider";

@Component({
    selector: 'app-loan-detail-dialog',
  imports: [
    MatIcon,
    MatIconButton,
    MatDialogClose,
    NgOptimizedImage,
    MatTooltip,
    NgxMaskPipe,
    RouterLink,
    MatDivider,
    NgIf
  ],
    templateUrl: './loan-detail-dialog.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoanDetailDialogComponent {
  public loan:Loan = inject(MAT_DIALOG_DATA)

  constructor(
    public amountService: AmountService,
    private templateService: TemplateService,
    private loanService: LoanService,
  ) {
  }

  // async exportToPdf() {
  //   const options: Options = {
  //     templateLang: 'ru',
  //     // templateLogo: './assets/images/stamp.jpg',
  //     templatePath: '/loan-detail.mustache',
  //     templateData: {
  //       ...this.loan,
  //       totalAmount: this.amountService.convertToAmount(this.loan.totalAmount.amount),
  //       mainDebt: this.amountService.convertToAmount(this.loan.mainDebt.amount),
  //       interestAmount: this.amountService.convertToAmount(this.loan.interestAmount.amount),
  //       penalty: this.amountService.convertToAmount(this.loan.penalty.amount),
  //       overdueAmount: this.amountService.convertToAmount(this.loan.overdueAmount.amount),
  //       overduePercentageDebt: this.amountService.convertToAmount(this.loan.overduePercentageDebt.amount),
  //       overPercentage: this.amountService.convertToAmount(this.loan.overPercentage.amount),
  //       repaymentAmount: this.amountService.convertToAmount(this.loan.repaymentAmount.amount),
  //       repaymentAmountMain: this.amountService.convertToAmount(this.loan.repaymentAmountMain.amount),
  //       percentageDebt: this.amountService.convertToAmount(this.loan.percentageDebt.amount),
  //     },
  //     templateName: 'loan-detail'
  //   };
  //   await this.templateService.showPdfInDialog(options);
  // }

  // exportToExcel() {
  //   this.loanService.exportLoanDetailToExcel(this.loan);
  // }

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

  protected readonly Number = Number;
}
