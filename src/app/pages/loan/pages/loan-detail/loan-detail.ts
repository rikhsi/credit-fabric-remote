import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Router } from '@angular/router';
import { CalculatorForm, CalculatorResult, CardAdvantage, ModalOtp, ProductAcception, ProductInfo } from '@pages/loan/components';
import { LOAN_ADVANTAGES_LIST } from '@pages/loan/data';
import { LoanAdvantageItem } from '@pages/loan/models';
import { Card } from '@shared/components';

@Component({
  selector: 'cf-loan-detail',
  imports: [CardAdvantage, ProductInfo, CalculatorForm, CalculatorResult, ProductAcception, Card, TranslocoDirective],
  templateUrl: './loan-detail.html',
  styleUrl: './loan-detail.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoanDetail {
  nmService = inject(NzModalService);
  router = inject(Router);

  readonly advantages: readonly LoanAdvantageItem[] = LOAN_ADVANTAGES_LIST;

  openConfirm(): void {
    this.nmService
      .create<ModalOtp, null, boolean>({
        nzContent: ModalOtp,
        nzFooter: null,
        nzTitle: null,
        nzClosable: null,
        nzCentered: true,
        nzCloseIcon: null,
        nzWidth: 'auto',
      })
      .afterClose.subscribe(() => {
        this.router.navigate(['/loan-application/general']);
      });
  }
}
