import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal, OnInit, ViewContainerRef } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzModalService } from 'ng-zorro-antd/modal';
import { filter } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { CalculatorForm, CalculatorResult, CardAdvantage, ModalOtp, ProductAcception, ProductInfo } from '@pages/loan/components';
import { LoanAdvantageItem, OtpModalData } from '@pages/loan/models';
import { Card } from '@shared/components';
import { ApplicationFlowRoute, RootRoute, RouteParam } from '@constants';
import { LoanDetailService } from '@pages/loan/services';
import { AuthService } from '@core/services';

@Component({
  selector: 'cf-loan-detail',
  imports: [CardAdvantage, ProductInfo, CalculatorForm, CalculatorResult, ProductAcception, Card, TranslocoDirective],
  templateUrl: './loan-detail.html',
  styleUrl: './loan-detail.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [LoanDetailService],
})
export class LoanDetail implements OnInit {
  private nmService = inject(NzModalService);
  private router = inject(Router);
  private ldService = inject(LoanDetailService);
  private vcRef = inject(ViewContainerRef);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  public readonly calculatorForm = linkedSignal(() => this.ldService.calculatorForm);
  public readonly agreementForm = linkedSignal(() => this.ldService.agreementForm);
  public readonly calculationResult = computed(() => this.ldService.calculationResult());
  public readonly loanDetail = computed(() => this.ldService.loanDetail());
  public readonly isValidated = computed(() => this.ldService.isValidated());
  public readonly user = computed(() => this.authService.user());

  get advantages(): LoanAdvantageItem[] {
    return this.route.snapshot.data['advantages'] || [];
  }

  get docs(): string[] {
    return this.route.snapshot.data['docs'] || [];
  }

  get loanId(): string {
    return this.route.snapshot.params[RouteParam.LoanId];
  }

  ngOnInit(): void {
    this.ldService.checkValidate$(this.user()?.pinfl).subscribe();
  }

  openConfirm(): void {
    const navigate = () => this.router.navigate([RootRoute.Application, this.loanId, ApplicationFlowRoute.General]);

    if (this.isValidated()) {
      navigate();
    } else {
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
            phoneNumber: this.user()?.phone_nubmer,
          },
        })
        .afterClose.pipe(filter((result) => !!result))
        .subscribe(navigate);
    }
  }
}
