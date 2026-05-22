import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal, OnInit, ViewContainerRef } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzModalService } from 'ng-zorro-antd/modal';
import { filter, forkJoin, switchMap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { CalculatorForm, CalculatorResult, CardAdvantage, ModalOtp, ProductAcception, ProductInfo } from '@pages/loan/components';
import { LoanAdvantageItem, OtpModalData } from '@pages/loan/models';
import { Card } from '@shared/components';
import { LoanDetailService } from '@pages/loan/services';
import { MonthsToYearsPipe } from '@shared/pipes';
import { RouteParam } from '@app/constants/route-param';
import { ApplicationFlowRoute, RootRoute } from '@app/constants/route-path';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'cf-loan-detail',
  imports: [CardAdvantage, ProductInfo, CalculatorForm, CalculatorResult, ProductAcception, Card, TranslocoDirective, MonthsToYearsPipe],
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
  public readonly productCondition = computed(() => this.ldService.productCondition());
  public readonly isValidated = computed(() => this.ldService.isValidated());
  public readonly user = computed(() => this.authService.user());
  public readonly isLoading = computed(() => this.ldService.isLoading());

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
    forkJoin([this.ldService.getCondition$(this.loanId), this.ldService.checkValidate$(this.user()?.pinfl)]).subscribe({
      next: () => {
        this.ldService.isLoading.set(false);
        this.ldService.isDisabled.set(false);
      },
    });
  }

  openConfirm(): void {
    const navigate = (applicationId: number) =>
      this.router.navigate([RootRoute.Application, this.loanId, applicationId, ApplicationFlowRoute.General]);

    if (this.isValidated()) {
      this.ldService.createShortApplication$().subscribe({
        next: ({ applicationId }) => {
          navigate(applicationId);
        },
      });
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
            phoneNumber: this.user()?.phone,
            pinfl: this.user()?.pinfl,
          },
        })
        .afterClose.pipe(
          filter((result) => !!result),
          switchMap(() => this.ldService.createShortApplication$()),
        )
        .subscribe({
          next: ({ applicationId }) => navigate(applicationId),
        });
    }
  }
}
