import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { LoanDetail } from '../../models/loan.model';
import { AmountService } from '../../../../../../core/services/amount.service';
import { NgClass } from '@angular/common';
import { LoanStatusIndicatorComponent } from '../my-loans/loan-status-indicator/loan-status-indicator.component';

@Component({
    selector: 'app-loan-info',
    imports: [
        NgClass,
        LoanStatusIndicatorComponent
    ],
    templateUrl: './loan-info.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoanInfoComponent implements OnChanges {
  @Input() loanDetail!: LoanDetail;
  @Input() short = false;
  details: any[] = [];
  shortDetails: any[] = [];

  constructor(
    private amountService: AmountService,
    private _cdRef: ChangeDetectorRef,
  ) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes['loanDetail'] && changes['loanDetail'].currentValue != undefined) {
      this.convertDetails();
      this.convertShortDetail();
      this.addLoanTitle();
    }
  }

  addLoanTitle() {
    this.loanDetail.accountTitle = this.loanDetail.accountTitle || 'Название кредита'
  }

  convertShortDetail() {
    const repaymentMainDebt = this.loanDetail.repaymentAmount.amount -
      this.loanDetail.interestAmount.amount;

    this.shortDetails = [
      {
        title: 'Погашения начисленных процентов',
        value: this.amountService.convertToAmount(this.loanDetail.interestAmount.amount),
      },
      {
        title: 'Платеж по основному долгу',
        value: this.amountService.convertToAmount(repaymentMainDebt),
      },
      {
        title: 'Общая сумма ',
        value: this.amountService.convertToAmount(this.loanDetail.repaymentAmount.amount),
      },
    ]
  }

  convertDetails() {
    this.details = [
      {
        title: 'Остаток основного долга',
        value: this.amountService.convertToAmount(this.loanDetail.mainDebt.amount)
      },
      {
        title: 'Сумма начисленных процентов',
        value: this.amountService.convertToAmount(this.loanDetail.interestAmount.amount),
      },
      {
        title: 'Пеня',
        value: this.amountService.convertToAmount(this.loanDetail.penalty.amount),
        color: 'text-red-[#FF3333]',
      },
      {
        title: 'Просроченный основной долг ',
        value: this.amountService.convertToAmount(this.loanDetail.overdueAmount.amount),
        color: 'text-red-[#FF3333]',
      },
      {
        title: 'Просроченные проценты',
        value: this.amountService.convertToAmount(this.loanDetail.overduePercentageDebt.amount),
        color: 'text-red-[#FF3333]',
      },
      {
        title: 'Повышенные проценты',
        value: this.amountService.convertToAmount(this.loanDetail.overPercentage.amount),
        color: 'text-red-[#FF3333]',
      },
      {
        title: 'Дата следующего платежа по графику',
        value: this.loanDetail.repaymentDate,
      },
      {
        title: 'Общая сумма следующего платежа по графику',
        value: this.amountService.convertToAmount(this.loanDetail.repaymentAmount.amount),
      },
      {
        title: 'В том числе основной долг',
        value: this.amountService.convertToAmount(this.loanDetail.repaymentAmountMain.amount),
      },
      {
        title: 'Проценты',
        value: this.amountService.convertToAmount(this.loanDetail.percentageDebt.amount),
      },
    ];
    this._cdRef.markForCheck();
  }


}
