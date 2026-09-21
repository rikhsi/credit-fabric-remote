import { ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, inject, linkedSignal, OnInit, viewChild, ViewContainerRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzModalService } from 'ng-zorro-antd/modal';
import { filter, forkJoin, take } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AddressForm, AddressInfo, CalculatorForm, CalculatorResult, FinanceForm, FinanceInfo, ProductAcception } from '@pages/loan/components';
import { Card } from '@shared/components';
import { LoanDetailService } from '@pages/loan/services';
import { AuthService } from '@core/services/auth.service';
import { EligibilityService } from '@core/services/eligibility.service';
import { LoanProductsService } from '@core/services/loan-products.service';
import { LoanRoute, RootRoute } from '@app/constants/route-path';
import { RouteParam } from '@app/constants/route-param';
import { OnlineStartProcessingAddress, OnlineStartProcessingFinData } from '@api/models/los/start-processing';
import { fetchHandbookItems } from '@shared/utils';
import { isFlowAddressFilled } from '@pages/loan/utils/address';
import { isFinDataFilled } from '@pages/loan/utils/finance';

@Component({
  selector: 'cf-loan-detail',
  imports: [AddressInfo, CalculatorForm, CalculatorResult, FinanceInfo, ProductAcception, Card, TranslocoDirective],
  templateUrl: './loan-detail.html',
  styleUrl: './loan-detail.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [LoanDetailService],
})
export class LoanDetail implements OnInit {
  private readonly nmService = inject(NzModalService);
  private readonly ldService = inject(LoanDetailService);
  private readonly productsService = inject(LoanProductsService);
  private readonly vcRef = inject(ViewContainerRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly eligibilityService = inject(EligibilityService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly http = inject(HttpClient);

  public readonly form = linkedSignal(() => this.ldService.form);
  public readonly calculationResult = computed(() => this.ldService.calculationResult());
  public readonly user = computed(() => this.authService.user());
  public readonly isLoading = computed(() => this.ldService.isLoading());

  private readonly addressSection = viewChild('addressSection', { read: ElementRef });
  private readonly financeSection = viewChild('financeSection', { read: ElementRef });

  get loanId(): string {
    return this.route.snapshot.params[RouteParam.LoanId];
  }

  ngOnInit(): void {
    this.ldService.applyProduct(this.productsService.getById(this.loanId)!);

    forkJoin([
      this.ldService.checkValidate$(this.user()?.pinfl),
      fetchHandbookItems(this.http, { url: 'dir-city' }),
      fetchHandbookItems(this.http, { url: 'dir-company-activity' }),
    ])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.ldService.isLoading.set(false);
          this.ldService.isDisabled.set(false);
        },
        error: () => {
          this.eligibilityService.isEligible.set(false);
          void this.router.navigate([RootRoute.Loan, LoanRoute.List]);
        },
      });
  }

  openAddressForm(): void {
    if (this.isLoading()) {
      return;
    }

    const [nzData] = this.ldService.form().value().addresses;

    const modalRef = this.nmService.create<AddressForm, OnlineStartProcessingAddress, OnlineStartProcessingAddress>({
      nzTitle: null,
      nzClosable: false,
      nzCloseIcon: null,
      nzContent: AddressForm,
      nzCentered: true,
      nzFooter: null,
      nzWidth: 'auto',
      nzViewContainerRef: this.vcRef,
      nzData,
    });

    modalRef.afterClose.pipe(filter(Boolean), take(1)).subscribe((value) => {
      this.ldService.form().value.update((cur) => ({
        ...cur,
        addresses: cur.addresses.map((item) => ({ ...value, sysAddressTypeId: item.sysAddressTypeId })),
      }));
    });
  }

  openFinanceForm(): void {
    if (this.isLoading()) {
      return;
    }

    const modalRef = this.nmService.create<FinanceForm, OnlineStartProcessingFinData, OnlineStartProcessingFinData>({
      nzTitle: null,
      nzClosable: false,
      nzCloseIcon: null,
      nzContent: FinanceForm,
      nzCentered: true,
      nzFooter: null,
      nzWidth: 'auto',
      nzViewContainerRef: this.vcRef,
      nzData: this.ldService.form().value().finData,
    });

    modalRef.afterClose.pipe(filter(Boolean), take(1)).subscribe((value) => {
      this.ldService.form().value.update((cur) => ({
        ...cur,
        finData: value,
      }));
    });
  }

  submit(): void {
    this.ldService.form().markAsDirty();

    const { addresses, finData } = this.ldService.form().value();

    if (!addresses.every(isFlowAddressFilled)) {
      this.scrollToSection(this.addressSection());
      return;
    }

    if (!isFinDataFilled(finData)) {
      this.scrollToSection(this.financeSection());
      return;
    }

    if (this.ldService.form().invalid()) {
      return;
    }
  }

  private scrollToSection(target: ElementRef<HTMLElement> | undefined): void {
    const el = target?.nativeElement;

    if (!el) {
      return;
    }

    const headerHeight = document.querySelector('cf-layout-header')?.getBoundingClientRect().height ?? 0;
    const top = window.scrollY + el.getBoundingClientRect().top - headerHeight - 8;

    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }
}
