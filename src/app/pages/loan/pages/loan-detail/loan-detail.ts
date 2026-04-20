import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal, ViewContainerRef } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzModalService } from 'ng-zorro-antd/modal';
import { filter } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { CalculatorForm, CalculatorResult, CardAdvantage, ModalOtp, ProductAcception, ProductInfo } from '@pages/loan/components';
import { LoanAdvantageItem, OtpModalData } from '@pages/loan/models';
import { Card } from '@shared/components';
import { ApplicationFlowRoute, RootRoute, RouteParam } from '@constants';
import { LoanDetailService } from '@pages/loan/services';
import { calculateAnnuity, calculateDifferential } from '@shared/utils';
import { CreditInput, CreditOutput } from '@app/typings/calculator';

const ANNUAL_RATE = 0.18;

@Component({
  selector: 'cf-loan-detail',
  imports: [CardAdvantage, ProductInfo, CalculatorForm, CalculatorResult, ProductAcception, Card, TranslocoDirective],
  templateUrl: './loan-detail.html',
  styleUrl: './loan-detail.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [LoanDetailService],
})
export class LoanDetail {
  private nmService = inject(NzModalService);
  private router = inject(Router);
  private ldService = inject(LoanDetailService);
  private vcRef = inject(ViewContainerRef);
  private route = inject(ActivatedRoute);

  public readonly calculatorForm = linkedSignal(() => this.ldService.calculatorForm);
  public readonly agreementForm = linkedSignal(() => this.ldService.agreementForm);

  public readonly calculationResult = computed<CreditOutput>(() => {
    const form = this.calculatorForm();
    const type = form.type().value();

    const input: CreditInput = {
      amount: form.amount().value(),
      term: form.term().value(),
      annualRate: ANNUAL_RATE,
    };

    if (type === 'annuity') {
      return calculateAnnuity(input);
    }

    return calculateDifferential(input);
  });

  get advantages(): LoanAdvantageItem[] {
    return this.route.snapshot.data['advantages'] || [];
  }

  get loanId(): string {
    return this.route.snapshot.params[RouteParam.LoanId];
  }

  openConfirm(): void {
    this.nmService
      .create<ModalOtp, OtpModalData, boolean>({
        nzContent: ModalOtp,
        nzFooter: null,
        nzTitle: null,
        nzClosable: null,
        nzCentered: true,
        nzCloseIcon: null,
        nzWidth: 'auto',
        nzMaskClosable: false,
        nzViewContainerRef: this.vcRef,
        nzData: {
          phoneNumber: '998990031497',
          documentName: 'публичный документ',
        },
      })
      .afterClose.pipe(filter((result) => !!result))
      .subscribe(() => {
        this.router.navigate([RootRoute.Application, this.loanId, ApplicationFlowRoute.General]);
      });
  }
}
