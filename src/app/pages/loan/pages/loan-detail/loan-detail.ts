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
import { TranslocoDirective } from '@jsverse/transloco';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzModalService } from 'ng-zorro-antd/modal';
import { filter, finalize, forkJoin, map, take } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AddressForm,
  AddressInfo,
  BranchForm,
  BranchInfo,
  CalculatorForm,
  CalculatorResult,
  ContactForm,
  ContactInfo,
  FinanceForm,
  FinanceInfo,
  ModalOtp,
  ProductAcception,
} from '@pages/loan/components';
import { Card } from '@shared/components';
import { BounceDirective } from '@shared/directives';
import { LoanDetailService } from '@pages/loan/services';
import { AuthService } from '@core/services/auth.service';
import { LoanBranchesService } from '@core/services/loan-branches.service';
import { LoanDraftService } from '@core/services/loan-draft.service';
import { LoanProductsService } from '@core/services/loan-products.service';
import { ToastService } from '@core/services/toast.service';
import { LoanLayoutService } from '@layouts/services';
import { HandbookApiService } from '@api/controllers/handbooks';
import { LoanRoute, RootRoute } from '@app/constants/route-path';
import { RouteParam } from '@app/constants/route-param';
import { Breakpoint } from '@app/constants/breakpoint';
import { StartProcessingAddress, StartProcessingFinData } from '@api/models/los/start-processing';
import { fetchHandbookItems, markTreeAsDirty } from '@shared/utils';
import { isFlowAddressFilled } from '@pages/loan/utils/address';
import { createEmptyContact, isContactFilled, isContactsFilled } from '@pages/loan/utils/contacts';
import { isFinDataFilled } from '@pages/loan/utils/finance';
import { showApplicationErrorToast, showApplicationSuccessToast } from '@pages/loan/utils/application-toast';
import { BranchFormData, ContactFormData, OtpModalData } from '@pages/loan/models';

export type MobileLoanStep = 'calc' | 'address' | 'contacts' | 'finance' | 'branch' | 'otp';

@Component({
  selector: 'cf-loan-detail',
  imports: [
    AddressForm,
    AddressInfo,
    BranchForm,
    BranchInfo,
    CalculatorForm,
    CalculatorResult,
    ContactForm,
    ContactInfo,
    FinanceForm,
    FinanceInfo,
    ModalOtp,
    ProductAcception,
    Card,
    NzButtonComponent,
    BounceDirective,
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
  private readonly branchesService = inject(LoanBranchesService);
  private readonly vcRef = inject(ViewContainerRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly handbookApi = inject(HandbookApiService);
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
  public readonly branchOptions = computed(() => this.branchesService.options());
  public readonly branchesLoading = computed(() => this.branchesService.isLoading());

  readonly isMobile = toSignal(
    this.breakpointObserver.observe(Breakpoint.MOBILE).pipe(map((state) => state.matches)),
    { initialValue: false },
  );

  readonly mobileStep = signal<MobileLoanStep>('calc');
  /** Active contact form index within the mobile contacts step. */
  readonly mobileContactIndex = signal(0);

  readonly otpData = computed<OtpModalData | null>(() => {
    const user = this.user();

    if (!user?.pinfl || !user?.phone) {
      return null;
    }

    return { pinfl: user.pinfl, phoneNumber: user.phone };
  });

  private readonly addressSection = viewChild('addressSection', { read: ElementRef });
  private readonly contactsSection = viewChild('contactsSection', { read: ElementRef });
  private readonly financeSection = viewChild('financeSection', { read: ElementRef });
  private readonly branchSection = viewChild('branchSection', { read: ElementRef });
  private readonly addressFormRef = viewChild(AddressForm);
  private readonly contactFormRef = viewChild(ContactForm);
  private readonly financeFormRef = viewChild(FinanceForm);
  private readonly branchFormRef = viewChild(BranchForm);

  get loanId(): string {
    return this.route.snapshot.params[RouteParam.LoanId];
  }

  ngOnInit(): void {
    // Any way back to the form starts a new application, the OneID draft must not survive it.
    this.loanDraft.clear();

    this.loanLayoutService.backClick$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.onHeaderBack());

    this.ldService.applyProduct(this.productsService.getById(this.loanId)!);

    forkJoin({
      validate: this.ldService.checkValidate$(),
      cities: fetchHandbookItems(this.handbookApi, { type: 'dir-city' }),
      activities: fetchHandbookItems(this.handbookApi, { type: 'dir-company-activity' }),
      relationships: fetchHandbookItems(this.handbookApi, { type: 'dir-family-relationship' }),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.ldService.isLoading.set(false);
          this.ldService.isDisabled.set(false);
        },
        error: () => {
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
          this.goToMobileStep('branch');
          return;
        case 'branch':
          this.goToMobileStep('finance');
          return;
        case 'finance': {
          const contacts = this.ldService.form().value().contacts;
          this.mobileContactIndex.set(Math.max(0, contacts.length - 1));
          this.goToMobileStep('contacts');
          return;
        }
        case 'contacts':
          this.onMobileContactBack();
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

  openContactForm(index?: number): void {
    if (this.isLoading()) {
      return;
    }

    const contacts = this.ldService.form().value().contacts;
    const nzData: ContactFormData =
      index == null
        ? {}
        : {
            contact: contacts[index],
            index,
          };

    const modalRef = this.nmService.create<ContactForm, ContactFormData, ContactFormData>({
      nzTitle: null,
      nzClosable: false,
      nzCloseIcon: null,
      nzContent: ContactForm,
      nzCentered: true,
      nzFooter: null,
      nzWidth: 'auto',
      nzViewContainerRef: this.vcRef,
      nzData,
    });

    modalRef.afterClose.pipe(filter(Boolean), take(1)).subscribe((result) => {
      this.ldService.form().value.update((cur) => {
        const next = [...cur.contacts];

        if (result.index != null) {
          next[result.index] = result.contact!;
        } else {
          next.push(result.contact!);
        }

        return {
          ...cur,
          contacts: next,
        };
      });
    });
  }

  removeContact(index: number): void {
    if (this.isLoading()) {
      return;
    }

    this.ldService.form().value.update((cur) => ({
      ...cur,
      contacts: cur.contacts.filter((_, i) => i !== index),
    }));
  }

  addAnotherContact(): void {
    if (this.isLoading()) {
      return;
    }

    if (!this.contactFormRef()?.validateInline()) {
      return;
    }

    this.ldService.form().value.update((cur) => ({
      ...cur,
      contacts: [...cur.contacts, createEmptyContact()],
    }));

    this.mobileContactIndex.set(this.ldService.form().value().contacts.length - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private ensureMobileContact(): void {
    const contacts = this.ldService.form().value().contacts;

    if (contacts.length > 0) {
      return;
    }

    this.ldService.form().value.update((cur) => ({
      ...cur,
      contacts: [createEmptyContact()],
    }));
  }

  private onMobileContactBack(): void {
    const index = this.mobileContactIndex();

    if (index <= 0) {
      this.goToMobileStep('address');
      return;
    }

    const contacts = this.ldService.form().value().contacts;
    const current = contacts[index];
    const isLast = index === contacts.length - 1;

    if (isLast && current && !isContactFilled(current)) {
      this.ldService.form().value.update((cur) => ({
        ...cur,
        contacts: cur.contacts.slice(0, -1),
      }));
    }

    this.mobileContactIndex.set(index - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  openBranchForm(): void {
    if (this.isLoading() || this.branchesLoading()) {
      return;
    }

    const modalRef = this.nmService.create<BranchForm, BranchFormData, number>({
      nzTitle: null,
      nzClosable: false,
      nzCloseIcon: null,
      nzContent: BranchForm,
      nzCentered: true,
      nzFooter: null,
      nzWidth: 'auto',
      nzViewContainerRef: this.vcRef,
      nzData: {
        filialCode: this.ldService.form().value().filialCode,
        options: this.branchOptions(),
        isLoading: this.branchesLoading(),
      },
    });

    modalRef.afterClose.pipe(filter((value): value is number => value != null), take(1)).subscribe((value) => {
      this.ldService.form().value.update((cur) => ({
        ...cur,
        filialCode: value,
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
        if (!this.addressFormRef()?.validateInline()) {
          return;
        }

        this.ensureMobileContact();
        this.mobileContactIndex.set(0);
        this.goToMobileStep('contacts');
        break;
      case 'contacts':
        if (!this.contactFormRef()?.validateInline()) {
          return;
        }

        if (!isContactsFilled(this.ldService.form().value().contacts)) {
          markTreeAsDirty(this.ldService.form.contacts);
          return;
        }

        this.goToMobileStep('finance');
        break;
      case 'finance':
        if (!this.financeFormRef()?.validateInline()) {
          return;
        }

        this.goToMobileStep('branch');
        break;
      case 'branch':
        markTreeAsDirty(this.ldService.form.filialCode);
        this.branchFormRef()?.validateInline();

        if (this.ldService.form.filialCode().value() == null) {
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
    this.goToMobileStep('branch');
  }

  submit(): void {
    markTreeAsDirty(this.ldService.form);

    const { addresses, contacts, finData, filialCode } = this.ldService.form().value();

    if (!isFlowAddressFilled(addresses)) {
      this.scrollToSection(this.addressSection());
      return;
    }

    if (!isContactsFilled(contacts)) {
      this.scrollToSection(this.contactsSection());
      return;
    }

    if (!isFinDataFilled(finData)) {
      this.scrollToSection(this.financeSection());
      return;
    }

    if (filialCode == null) {
      this.scrollToSection(this.branchSection());
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
