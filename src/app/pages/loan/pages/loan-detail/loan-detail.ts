import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  linkedSignal,
  OnInit,
  signal,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver } from '@angular/cdk/layout';
import { HttpClient } from '@angular/common/http';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzModalService } from 'ng-zorro-antd/modal';
import { filter, finalize, forkJoin, map, take } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AddressForm,
  AddressInfo,
  CalculatorForm,
  CalculatorResult,
  FinanceForm,
  FinanceInfo,
  ModalOtp,
  ProductAcception,
} from '@pages/loan/components';
import { Card } from '@shared/components';
import { LoanDetailService } from '@pages/loan/services';
import { AuthService } from '@core/services/auth.service';
import { EligibilityService } from '@core/services/eligibility.service';
import { LoanDraftService } from '@core/services/loan-draft.service';
import { LoanProductsService } from '@core/services/loan-products.service';
import { ToastService } from '@core/services/toast.service';
import { LoanLayoutService } from '@layouts/services';
import { LoanRoute, RootRoute } from '@app/constants/route-path';
import { RouteParam } from '@app/constants/route-param';
import { Breakpoint } from '@app/constants/breakpoint';
import { StartProcessingAddress, StartProcessingFinData } from '@api/models/los/start-processing';
import { fetchHandbookItems } from '@shared/utils';
import { isFlowAddressFilled } from '@pages/loan/utils/address';
import { isFinDataFilled } from '@pages/loan/utils/finance';
import { showApplicationErrorToast, showApplicationSuccessToast } from '@pages/loan/utils/application-toast';
import { OtpModalData } from '@pages/loan/models';

export type MobileLoanStep = 'calc' | 'address' | 'finance' | 'otp';

@Component({
  selector: 'cf-loan-detail',
  imports: [
    AddressForm,
    AddressInfo,
    CalculatorForm,
    CalculatorResult,
    FinanceForm,
    FinanceInfo,
    ModalOtp,
    ProductAcception,
    Card,
    TranslocoDirective,
  ],
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
  private readonly loanDraft = inject(LoanDraftService);
  private readonly toast = inject(ToastService);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly loanLayoutService = inject(LoanLayoutService);

  public readonly form = linkedSignal(() => this.ldService.form);
  public readonly agreementForm = linkedSignal(() => this.ldService.agreementForm);
  public readonly calculationResult = computed(() => this.ldService.calculationResult());
  public readonly user = computed(() => this.authService.user());
  public readonly isLoading = computed(() => this.ldService.isLoading());
  public readonly isSubmitting = signal(false);

  readonly isMobile = toSignal(
    this.breakpointObserver.observe(Breakpoint.MOBILE).pipe(map((state) => state.matches)),
    { initialValue: false },
  );

  readonly mobileStep = signal<MobileLoanStep>('calc');

  readonly otpData = computed<OtpModalData | null>(() => {
    const user = this.user();

    if (!user?.pinfl || !user?.phone) {
      return null;
    }

    return { pinfl: user.pinfl, phoneNumber: user.phone };
  });

  private readonly addressSection = viewChild('addressSection', { read: ElementRef });
  private readonly financeSection = viewChild('financeSection', { read: ElementRef });
  private readonly addressFormRef = viewChild(AddressForm);
  private readonly financeFormRef = viewChild(FinanceForm);

  get loanId(): string {
    return this.route.snapshot.params[RouteParam.LoanId];
  }

  ngOnInit(): void {
    // Any way back to the form starts a new application, the OneID draft must not survive it.
    this.loanDraft.clear();

    this.loanLayoutService.backClick$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.onHeaderBack());

    this.ldService.applyProduct(this.productsService.getById(this.loanId)!);

    forkJoin([
      this.ldService.checkValidate$(),
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

  private onHeaderBack(): void {
    this.loanLayoutService.handleBackClick();

    if (this.isMobile()) {
      switch (this.mobileStep()) {
        case 'otp':
          this.isSubmitting.set(false);
          this.goToMobileStep('finance');
          return;
        case 'finance':
          this.goToMobileStep('address');
          return;
        case 'address':
          this.goToMobileStep('calc');
          return;
        default:
          break;
      }
    }

    this.loanLayoutService.navigateByBackConfig();
  }

  openAddressForm(): void {
    if (this.isLoading()) {
      return;
    }

    const nzData = this.ldService.form().value().addresses;

    const modalRef = this.nmService.create<AddressForm, StartProcessingAddress, StartProcessingAddress>({
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
        addresses: value,
      }));
    });
  }

  openFinanceForm(): void {
    if (this.isLoading()) {
      return;
    }

    const modalRef = this.nmService.create<FinanceForm, StartProcessingFinData, StartProcessingFinData>({
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

  onMobileContinue(): void {
    switch (this.mobileStep()) {
      case 'calc':
        this.agreementForm().offer().markAsDirty();

        if (this.agreementForm()().invalid()) {
          return;
        }

        this.goToMobileStep('address');
        break;
      case 'address':
        this.ldService.form().markAsDirty();
        this.addressFormRef()?.validateInline();

        if (!isFlowAddressFilled(this.ldService.form().value().addresses)) {
          return;
        }

        this.goToMobileStep('finance');
        break;
      case 'finance':
        this.ldService.form().markAsDirty();
        this.financeFormRef()?.validateInline();

        if (!isFinDataFilled(this.ldService.form().value().finData)) {
          return;
        }

        this.submitApplication();
        break;
      default:
        break;
    }
  }

  onOtpConfirmed(confirmed: boolean): void {
    if (confirmed) {
      this.ldService.isValidated.set(true);
      this.checkOneId();
      return;
    }

    this.isSubmitting.set(false);
    this.goToMobileStep('finance');
  }

  submit(): void {
    this.ldService.form().markAsDirty();

    const { addresses, finData } = this.ldService.form().value();

    if (!isFlowAddressFilled(addresses)) {
      this.scrollToSection(this.addressSection());
      return;
    }

    if (!isFinDataFilled(finData)) {
      this.scrollToSection(this.financeSection());
      return;
    }

    this.submitApplication();
  }

  private submitApplication(): void {
    if (this.ldService.form().invalid() || this.ldService.agreementForm().invalid() || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);

    if (this.ldService.isValidated()) {
      this.checkOneId();
      return;
    }

    if (this.isMobile()) {
      this.goToMobileStep('otp');
      return;
    }

    this.openOtpModal();
  }

  private goToMobileStep(step: MobileLoanStep): void {
    this.mobileStep.set(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private openOtpModal(): void {
    const user = this.user();

    const modalRef = this.nmService.create<ModalOtp, OtpModalData, boolean>({
      nzTitle: null,
      nzClosable: false,
      nzCloseIcon: null,
      nzContent: ModalOtp,
      nzCentered: true,
      nzFooter: null,
      nzWidth: 'auto',
      nzViewContainerRef: this.vcRef,
      nzData: {
        pinfl: user?.pinfl,
        phoneNumber: user?.phone,
      },
    });

    modalRef.afterClose.pipe(take(1)).subscribe((confirmed) => {
      if (confirmed) {
        this.ldService.isValidated.set(true);
        this.checkOneId();
        return;
      }

      this.isSubmitting.set(false);
    });
  }

  /** The application can only be processed once the client shared their data through OneID. */
  private checkOneId(): void {
    this.ldService
      .checkOneId$()
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (granted) => (granted ? this.startProcessing() : this.goToOneId()),
        error: () => this.finishWithError(),
      });
  }

  private goToOneId(): void {
    this.loanDraft.save(this.ldService.buildPayload());
    this.isSubmitting.set(false);

    void this.router.navigate(['/', RootRoute.OneId]);
  }

  private startProcessing(): void {
    this.ldService
      .startProcessing$()
      .pipe(
        take(1),
        finalize(() => this.isSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => this.finishWithSuccess(),
        error: (error) => this.finishWithError(error),
      });
  }

  private finishWithSuccess(): void {
    this.loanDraft.clear();
    showApplicationSuccessToast(this.toast);
    void this.router.navigate(['/', RootRoute.Applications], { replaceUrl: true });
  }

  private finishWithError(error?: unknown): void {
    this.isSubmitting.set(false);
    this.loanDraft.clear();
    showApplicationErrorToast(this.toast, error);
    void this.router.navigate(['/', RootRoute.Applications], { replaceUrl: true });
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
