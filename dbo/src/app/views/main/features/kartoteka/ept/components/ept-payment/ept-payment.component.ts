import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, DestroyRef,
  EventEmitter, HostListener,
  Input,
  OnInit,
  Output, signal, SimpleChanges
} from "@angular/core";
import { filter } from 'rxjs/operators';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from "@angular/common";
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { NgxMaskDirective, NgxMaskPipe } from "ngx-mask";
import { UtilsService } from "src/app/core/services/utils.service";
import { AmountService } from "src/app/core/services/amount.service";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { AutoPayForm } from "src/app/views/main/features/create-autopay/interfaces/auto-pay.interface";
import { CreateEptBankMailDocumentPayload, PaymentService } from "src/app/core/services/payment.service";
import { AccountsPaymentsService } from "src/app/views/main/features/accounts-payments/services/accounts-payments.service";
import { AccountService } from "src/app/core/services/account.service";
import { ToastrService } from "ngx-toastr";
import { AutopayService } from "src/app/core/services/autopay.service";
import { TransactionOneDetailDto } from "src/app/core/models/transaction.models";
import {debounceTime, distinctUntilChanged, firstValueFrom, Subject, take} from "rxjs";
import { TransactionModes } from "src/app/views/auth/constants/transaction-list.const";
import { MfoModalComponent} from "src/app/views/main/features/add-payment/modals/mfo-modal/mfo-modal.component.component";
import { UserInfoDto } from "src/app/core/models/user.model";
import { AccountsDto, BudgetReferenceContentDto, PurposeContent } from "src/app/views/main/features/accounts-payments/models/accounts-payments.model";
import { animate, style, transition, trigger } from "@angular/animations";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { TranslateModule } from "@ngx-translate/core";
import {SpinnerComponent} from "src/app/core/components/spinner/spinner.component";
import {FirebaseAnalyticsService} from "../../../../../../../../../firebase-analytics.service";
import { Account } from "src/app/views/main/features/add-payment/components/transfer-to-account/transfer-to-account.component";
import {
  PaymentSuccessModalComponent
} from "../../../../../../../shared/components/payment-success-modal/payment-success-modal";

@Component({
  selector: 'app-ept-payment',
  standalone: true,
  imports: [CommonModule, MatTooltipModule, MatDatepickerModule, MatFormFieldModule, MatInputModule, MatNativeDateModule, RouterModule, ReactiveFormsModule, NgxMaskDirective, NgxMaskPipe, FormsModule, TranslateModule, SpinnerComponent],
  templateUrl: './ept-payment.component.html',
  styles: [
    `
      ::ng-deep .custom-select1.mat-mdc-form-field.mat-form-field-appearance-outline .mat-mdc-text-field-wrapper {
        border-radius: 22px !important; // radius kattaroq
        background: #FAFAFA; // fon rang
      }

      ::ng-deep .custom-select1 .mdc-notched-outline {
        border-color: #E4E4E4 !important; // outline rang
      }

      ::ng-deep .custom-select1.mat-mdc-form-field {
        padding: 0; // yuqori/pastki ortiqcha joyni olib tashlash
      }

      ::ng-deep .mat-calendar-body-selected {
        background-color: #00A38D !important;
      }

    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('dropdownAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scaleY(0)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'scaleY(1)' })),
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'scaleY(0)' })),
      ]),
    ]),
  ]
})
export class EptPaymentComponent implements OnInit {
  @Input() autoPay = false;
  @Input() autoPayForm!: AutoPayForm;
  @Input() docNum!: string;
  @Input() docDate!: any;
  @Input() selectedAccount!: any;
  @Input() fromQuery = '';
  @Input() toQuery = ''
  @Output() senderAccountTouched = new EventEmitter<boolean>();
  @Output() purposeTouched = new EventEmitter<boolean>();

  @Input() editPayment!: any;
  @Input() repeatPayment!: any;

  isOpen = false;
  openAccount = false;
  openFindPurposes = false;
  openPurposePaymentType = false;
  touched = false;
  templateCreateModal = false;
  purposeCode = '';
  templateName = '';
  templateError = false;
  tempAccount = '';
  templateLoaded = false;
  purposeCodeForCheck: any = null
  paymentDescription = '';
  amountInWords = '';
  accounts: any[] = [];
  purposes: any[] = [];
  purposesPayment: PurposeContent[] = [];
  purposesEptUnpaid: PurposeContent[] = [];
  /** prepare-uzs-transaction `additionalInfo.purposeType` */
  readonly eptAdditionalPurposeType = 'CREATE_EPT';
  /** getPurposes `typePurpose` for kartoteka purpose list */
  readonly eptUnpaidPurposeType = 'CREATE_EPT_UNPAID';
  openKartotekaPurpose = false;
  bankName: string = "";
  codeInput: boolean = false;
  receiverAccounts: any[] = [];
  type = 'TRANSACTION';
  purposePage = 0;
  purposeSize = 20;
  balanceErrorOver = "";
  templateId: string = "";
  searchPurposeText = signal<string>('');
  minDate = signal<any>('');
  choosedAcount = signal<Account | Record<string, any>>({});
  massDocDate = signal<string>('')
  businessInfo: UserInfoDto | Record<string, any> = {};
  templatePayment!: TransactionOneDetailDto;
  purposesAfterFilter = signal<any[]>([])
  templateList = signal<any[]>([])
  spinnerState = signal<boolean>(false);
  errorMessage = signal<string>('');
  searchText = signal<string>('');
  private dialogRef: MatDialogRef<MfoModalComponent> | null = null;
  inputSubject = new Subject<any>();
  inputAccSubject = new Subject<any>();
  inputTaxSubject = new Subject<any>();
  selectedAccountData = signal<AccountsDto | null>(null)
  navs = [
    {
      title: 'Главная',
      link: '/'
    },
    {
      title: 'Платежи',
      link: '/payment'
    },
    {
      title: "Перевести на счёт",
      link: '/'
    },
  ];
  signForm: FormGroup = new FormGroup({
    templateId: new FormControl(null),
    type: new FormControl('121'),
    // windowType: new FormControl('TRANSACTION'),
    balance: new FormGroup({
      amount: new FormControl(null, [Validators.required, Validators.min(0.01)]),
      scale: new FormControl(2),
      currency: new FormControl('UZS'),
    }),
    saldo: new FormGroup({
      amount: new FormControl(null),
      scale: new FormControl(2),
      currency: new FormControl('UZS'),
    }),
    description: new FormControl("", [Validators.required, Validators.maxLength(450)]),
    docNum: new FormControl(''),
    docDate: new FormControl(null, Validators.required),
    isAnor: new FormControl(false),
    withAnor: new FormControl(false),
    isSaved: new FormControl(false),
    isAutoPay: new FormControl(false),
    sender: new FormGroup({
      // accountToForm: new FormControl('', Validators.required),
      account: new FormControl('', Validators.required),
      pinfl: new FormControl(null),
    }),
    name: new FormControl(''),
    windowType: new FormControl('CREATE_EPT'),
    transactionMode: new FormControl('CREATE_EPT'),
    recipient: new FormGroup({
      account: new FormControl('', [Validators.minLength(20), Validators.maxLength(27), Validators.required]),
      codeFilial: new FormControl('', [Validators.minLength(5), Validators.maxLength(5), Validators.required]),
      tax: new FormControl(null),
      name: new FormControl('', Validators.required),
      pinfl: new FormControl(null),
      bankName: new FormControl(''),
      innOrPnfl: new FormControl('', [ Validators.pattern(/^(\d{9}|\d{14})$/), Validators.required]),
    }),
    eptRequirementKindCode: new FormControl('', Validators.required),
    eptKartotekaPurposeCode: new FormControl('', Validators.required),
    purpose: new FormGroup({
      name: new FormControl(null, Validators.required),
      code: new FormControl(null),
    }),
    // description: new FormControl(this.paymentDescription),
  });

  constructor(
    private dialog: MatDialog,
    private amountsService: AmountService,
    private paymentService: PaymentService,
    private accountsPaymentService: AccountsPaymentsService,
    private accountService: AccountService,
    private destroyRef: DestroyRef,
    private _cdRef: ChangeDetectorRef,
    private utilsService: UtilsService,
    private toastrService: ToastrService,
    protected activatedRoute: ActivatedRoute,
    private matDialog: MatDialog,
    public router: Router,
    private autoPayService: AutopayService,
    private _utilsService: UtilsService,
    private analyticsService: FirebaseAnalyticsService,
  ) {
  }

 async ngOnInit() {
   this.analyticsService.logFirebaseCustomEvent('create_transfer_screen_jump', null);

   this.spinnerState.set(true);

   try {
     const query = await firstValueFrom(this.activatedRoute.queryParams.pipe(take(1)));

     const type = this.activatedRoute.snapshot.queryParamMap.get('type');
     const mode = this.activatedRoute.snapshot.queryParamMap.get('mode');

     if (type === 'edit') {
       await this.getTemplateDetails(query["templateId"]);
       this.templateName = query["templateName"];
       this.templateId = query["templateId"];
     }

     if (type === 'reverse') {
       console.log('reverse')
       await this.getTransactionOneForReverse();
     }

     if (type === 'repeat' || mode === 'transaction') {
       await this.getTransactionOneForRepeat();
     }
     if (mode === 'mass') {
       await this.getTransactionPreError()
     }
     await Promise.all([
       this.getAccountDataFromQuearyParams(),
       this.getDocDate(),
       this.getDocNumber(),
       this.getPurposeList()
     ]);
     await this.loadEptRequirementKinds();
     await this.loadEptKartotekaPurposes();
   } catch (e) {
   } finally {
     this.spinnerState.set(false);
     this._cdRef.detectChanges();
   }

    // this.getAccounts1();
    this.inputSubject
      .pipe(debounceTime(800), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((val) => {
        this.purposeCode = val.target.value
        this.getPurposeList();
        this.openFindPurposes = true;
      });

   this.inputAccSubject.pipe(debounceTime(800), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
     .subscribe((val) => {
       this.getReferences(val)
     });
   this.inputTaxSubject.pipe(debounceTime(800), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
     .subscribe((val) => {
       this.onTaxInput(val)
     });
    // this.activatedRoute.queryParams.pipe(takeUntilDestroyed(this.destroyRef))
    //   .subscribe(query => {
    //     if (this.activatedRoute.snapshot.queryParamMap.get('type') === 'edit') {
    //       this.getTemplateDetails(query["templateId"])
    //       this.templateName = query["templateName"]
    //       this.templateId = query["templateId"]
    //     }
    //     if (this.activatedRoute.snapshot.queryParamMap.get('type') === 'reverse') {
    //       this.getTransactionOneForReverse()
    //     }
    //     if (this.activatedRoute.snapshot.queryParamMap.get('type') === 'repeat' || this.activatedRoute.snapshot.queryParamMap.get('mode') === 'transaction') {
    //       this.getTransactionOneForRepeat()
    //     }
    //   })
    this.businessInfo = JSON.parse(localStorage.getItem("businessInfo") as string);
    this.signForm.get('recipient.codeFilial')?.valueChanges
      .pipe(
        filter(value => value !== null && value !== ''),
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(value => {
        this.utilsService.spinnerState$$.next(true);
        this.accountsPaymentService.getMfoDetails(value).pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (res: any) => {
              this.bankName = res?.bankBranchName
              this._cdRef.detectChanges();
            },
            complete: () => {
              this._cdRef.markForCheck();
            }
          })
      });
    // this.watchBankCode();
    // this.watchAccount();
    // this.watchTemplate();
    // this.watchRoute();
    // if (this.editPayment) {
    //   this.updateForm(this.editPayment);
    // }
    // this.activatedRoute.queryParamMap
    //   .pipe(takeUntilDestroyed(this.destroyRef))
    //   .subscribe((queries) => {
    //     this.toQuery = queries.get('from') || '';
    //     this.fromQuery = queries.get('to') || '';
    //   })


  }

  onTaxInput(event: Event) {
    const input = event.target as HTMLInputElement;

    input.value = input.value.replace(/\D/g, '');

    this.signForm.get('recipient.tax')?.setValue(input.value, {
      emitEvent: false
    });

    this.getAccountReferences(input.value);
  }

  async getAccountDataFromQuearyParams(): Promise<void> {
    const params = await firstValueFrom(
      this.activatedRoute.queryParams.pipe(take(1))
    );

    if (params['account']) {
      try {
        const account = JSON.parse(decodeURIComponent(params['account']));

        this.chooseAccFunc(account);
        this.signForm.get('sender')?.get('account')?.setValue(account.altAcctId);
        this.selectedAccountData.set(account);
        this.accounts = [account];

        await this.getTemplates(); // если нужно
      } catch (e) {
        console.error('failed to parse account from query param', e);
      }
    } else {
      await this.getAccounts1();
      await this.getTemplates();
    }
  }

  closeDropdown() {
    this.isOpen = false;
  }

  setTemplateName(event: any) {
    this.templateError = event.target.value?.length <= 0;
    this.templateName = event.target.value;
  }

  setValuesToForm(path: string, event: any, type: 'input' | 'text') {
    const value = type === 'input' ? event.target.value : event;
    const keys = path.split('.');
    let current = this.signForm;

    for (let i = 0; i < keys.length - 1; i++) {
      current = current.get(keys[i]) as FormGroup;
      if (!current) return;
    }

    current.patchValue({ [keys[keys.length - 1]]: value });
  }

  selectSenderAccount(account: any | null) {
    if (account) {
      this.selectedAccount = account;
    }
    this._cdRef.detectChanges();
  }

  purposeSelect(purpose: any) {
    this.signForm.patchValue({
      purpose: {
        name: purpose.value,
        code: purpose.key,
        purposeCode: purpose.key,
      }
    })
  }

  async getDocNumber(): Promise<void> {
    const mode = this.activatedRoute.snapshot.queryParamMap.get('mode');
    if (mode === 'transaction' || mode === 'mass') {
      return
    }
    const res = await firstValueFrom(this.paymentService.getPaymentDocNum());
      this.signForm.patchValue({
        docNum: res.msg
    });
  }
  async getAccounts1(): Promise<void> {
    const accounts = await firstValueFrom(
      this.accountService.getPaymentAllowed(
        { size: 100, page: 0 },
        { transactionMode: "TRANSACTION", senderAccount: null }
      )
    );

    if (accounts) {
      if (accounts.content?.length > 0) {
        const firstActive = accounts.content.find(item => item.status !== 'BLOCKED');
        if (firstActive) {
          this.choosedAcount.set(firstActive);
        }

        this.signForm.patchValue({
          sender: {
            account: accounts.content[0].altAcctId
          }
        });
      }

      this.accounts = accounts.content ?? [];
      this._cdRef.detectChanges();
    }
  }

  //
  // getPurposeAfterSearch(code: any) {
  //   this.inputSubject
  //     .pipe(debounceTime(800), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
  //     .subscribe((val) => {
  //       this.purposeCode = val.target.value
  //     });
  //   console.log("change")
  //   this.getPurposeList();
  // }

  async getPurposeList(): Promise<void> {
    const res = await firstValueFrom(
      this.paymentService.getPurposes({
        page: 0,
        size: 1000,
        searchText: this.purposeCode,
        typePurpose: 'CREATE_EPT_PURPOSE'
      })
    );

    const content = res?.content;

    if (Array.isArray(content)) {
      if (this.purposePage === 0) {
        this.purposes = content;
      } else {
        this.purposes = [...this.purposes, ...content];
      }
    }

    this._cdRef.markForCheck();
  }

  async loadEptRequirementKinds(): Promise<void> {
    const res = await firstValueFrom(
      this.paymentService.getPurposes({
        page: 0,
        size: 1000,
        searchText: '',
        typePurpose: this.eptAdditionalPurposeType,
      })
    );
    const content = res?.content as PurposeContent[] | undefined;
    this.purposesPayment = Array.isArray(content) ? content : [];
    this._cdRef.markForCheck();
  }

  async loadEptKartotekaPurposes(): Promise<void> {
    const res = await firstValueFrom(
      this.paymentService.getPurposes({
        page: 0,
        size: 1000,
        searchText: '',
        typePurpose: this.eptUnpaidPurposeType,
      })
    );
    const content = res?.content as PurposeContent[] | undefined;
    this.purposesEptUnpaid = Array.isArray(content) ? content : [];
    this._cdRef.markForCheck();
  }

  selectPurposePaymentType(purpose: PurposeContent): void {
    this.openPurposePaymentType = false;
    this.openKartotekaPurpose = false;
    this.openFindPurposes = false;
    this.signForm.patchValue({ eptRequirementKindCode: purpose.code });
    this._cdRef.markForCheck();
  }

  selectKartotekaPurpose(purpose: PurposeContent): void {
    this.openKartotekaPurpose = false;
    this.openPurposePaymentType = false;
    this.openFindPurposes = false;
    this.signForm.patchValue({ eptKartotekaPurposeCode: purpose.code });
    this._cdRef.markForCheck();
  }

  selectedKartotekaPurposeLabel(): string {
    const code = this.signForm.get('eptKartotekaPurposeCode')?.value;
    if (!code) return '';
    const p = this.purposesEptUnpaid.find(x => x.code === code);
    return p ? `${p.code} - ${p.name}` : String(code);
  }

  selectedEptRequirementKindLabel(): string {
    const code = this.signForm.get('eptRequirementKindCode')?.value;
    if (!code) return '';
    const p = this.purposesPayment.find(x => x.code === code);
    return p ? `${p.code} - ${p.name}` : String(code);
  }

  private eptRequirementKindFromAdditionalInfo(additionalInfo: any): string {
    if (!additionalInfo) return '';
    if (additionalInfo.eptRequirementKindCode) return additionalInfo.eptRequirementKindCode;
    if (additionalInfo.purposeType && additionalInfo.purposeType !== this.eptAdditionalPurposeType) {
      return additionalInfo.purposeType;
    }
    return '';
  }

  private eptKartotekaPurposeCodeFromAdditionalInfo(additionalInfo: any): string {
    if (!additionalInfo) return '';
    return additionalInfo.eptKartotekaPurposeCode ?? '';
  }

  private applyEptAdditionalInfoToPayload(formValue: any): void {
    const eptKind = formValue.eptRequirementKindCode;
    const kartoteka = formValue.eptKartotekaPurposeCode;
    delete formValue.eptRequirementKindCode;
    delete formValue.eptKartotekaPurposeCode;
    formValue.additionalInfo = {
      ...(formValue.additionalInfo || {}),
      purposeType: this.eptAdditionalPurposeType,
      ...(eptKind ? { eptRequirementKindCode: eptKind } : {}),
      ...(kartoteka ? { eptKartotekaPurposeCode: kartoteka } : {}),
    };
  }

  setMfoFromSelect(mfo) {
      this.signForm.patchValue({
        recipient: {
          codeFilial: mfo.nibbdBankBranchCode
        }
      })
  }

  openMfoChooseList() {
    if (!this.dialogRef) {
      this.accountsPaymentService.getMfoList({
        page: 0,
        size: 200,
        search: '',
        bankBranchCode: null
      }).pipe().subscribe({
        next: result => {
          this.dialogRef = this.matDialog.open(MfoModalComponent, {
            data: {
              mfo: this.signForm.getRawValue().recipient.codeFilial,
              setMfo: (value: any) => this.setMfoFromSelect(value),
            },
            width: '600px',
            height: 'calc(100% - 8px)',
            position: { right: '0' },
            panelClass: 'right-side-dialog',
          });
          this.dialogRef.afterClosed().subscribe(() => {
            this.dialogRef = null;
          });
          if (this.dialogRef?.componentInstance) {
            this.dialogRef.componentInstance.mfoList = result.content;
          }
        }
      })
    }
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  // @HostListener('window:keydown', ['$event'])
  // handleKeyDown(event: KeyboardEvent) {
  //   if (event.key === 'F9') {
  //     event.preventDefault();
  //     this.openChooseList();
  //   }
  // }

  getAccount(account: string) {
    this.accountService.getAccountInfo(account)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res) {
            this.selectedAccount = {
              ...res,
              altAcctId: res?.accountNumberCard
            };
            this._cdRef.markForCheck();
          }
        }
      })
  }

  selectAccountFromTemplate(account: string) {
    const acc = this.accounts
      ?.find(acc => acc.altAcctId == account);

    if (acc) {
      this.selectSenderAccount(acc);
    } else if (this.fromQuery === 'template-payment') {
      this.getAccount(account);
    }
  }

  selectAccountFromEdit(account: string) {
    const acc = this.accounts
      ?.find(acc => acc.altAcctId == account);

    if (acc) {
      this.selectSenderAccount(acc);
    } else if (this.fromQuery === 'edit-payment') {
      this.getAccount(account);
    }
  }

  async getTemplates(): Promise<void> {
    this.templateList.set([]);
  }

  getAccounts() {
    let type = this.type;
    if (this.type === 'BUDGET_INCOME') {
      type = 'BUDGET';
    }
    const data: any = {
      senderAccount: null,
      transactionMode: type,
    }
    this.accountService.getPaymentAllowed({
      page: 0,
      size: 10
    }, data).pipe(take(1))
      .subscribe((val) => {
        if (val) {
          if (val && Array.isArray(val.content)) {
            this.accounts = val.content.filter(account => account.codeCurrency === "000");
            this.selectedAccount = val.content[0];
            this.touched = false;
            if (this.fromQuery === 'template-payment') {
              const account = this.templatePayment.sender.account
              if (account) {
                this.selectAccountFromTemplate(account);
              }
            }
            if (this.fromQuery === 'edit-payment') {
              const account = this.editPayment.sender.account;
              if (account) {
                this.selectAccountFromEdit(account)
                // this.getAccount(account);
              }
            }
            if (this.fromQuery === 'repeat-payment') {
              const account = this.templatePayment.sender.account;
              if (account) {
                this.selectAccountFromEdit(account)
                // this.getAccount(account);
              }
            }
          }
        }
        this._cdRef.detectChanges();
      })
    // this._accountService.getAccountInfo(acc)
    //   .pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => {
    //   if (!res) return
    //   this.matDialog.open(AccountsPaymentsDetailsComponent, {
    //     data: {...res},
    //     width: '400px',
    //     height: 'calc(100% - 32px)',
    //     position: {
    //       right: '16px',
    //     },
    //     panelClass: 'right-side-dialog',
    //   })
    // })
  }

  closePage() {
    const returnUrl = this.activatedRoute.snapshot.queryParamMap.get('returnUrl')
    if (returnUrl) {
      this.router.navigateByUrl(returnUrl)
    } else if (this.router.url.includes('/EPT/payment')) {
      this.router.navigate(['/EPT'])
    } else {
      this.router.navigate(['payment'])
    }
  }

  closeToTemplate() {
    const returnUrl = this.activatedRoute.snapshot.queryParamMap.get('returnUrl')
    if (returnUrl) {
      this.router.navigateByUrl(returnUrl)
    } else {
      this.router.navigate(['//EPT'])
    }
  }

  getTemplateDetails(templateId: string, templateName?: string) {
    if (templateName) {
      this.templateName = templateName
    }
    this.accountsPaymentService.getSavedPaymentDetails(templateId).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (templateDetails: any) => {
          setTimeout(() => {
            const account = this.accounts?.find(acc => acc.altAcctId === templateDetails.sender.account);
            if (account) {
              this.choosedAcount.set(account)
            } else {
              this.choosedAcount.set({
                altAcctId: templateDetails.sender.account
              })
            }
            this.signForm.patchValue({
              saldo: templateDetails.isDebit ?
                { amount: templateDetails.senderAmount.amount / 100 } :
                { amount: templateDetails.receiverAmount.amount / 100 },
              balance: templateDetails.isDebit ?
                { amount: templateDetails.senderAmount.amount / 100 } :
                { amount: templateDetails.receiverAmount.amount / 100 },
              description: templateDetails.description,
              eptRequirementKindCode: this.eptRequirementKindFromAdditionalInfo(templateDetails.additionalInfo),
              eptKartotekaPurposeCode: this.eptKartotekaPurposeCodeFromAdditionalInfo(templateDetails.additionalInfo),
              sender: {
                account: account ? this.accounts[0] : this.choosedAcount(),
                pinfl: templateDetails.sender.pinfl,
              },
              recipient: {
                account: templateDetails.recipient.account,
                codeFilial: templateDetails.recipient.codeFilial,
                tax: templateDetails.recipient.tax,
                name: templateDetails.recipient.name,
                pinfl: templateDetails.recipient.pinfl,
                innOrPnfl: templateDetails?.recipient.tax ?? templateDetails.recipient.pinfl,
                bankName: templateDetails.recipient.bankName,
              },
              name: templateDetails.name,
              purpose: {
                name: templateDetails.purpose.name,
                code: templateDetails.purpose.code,
              },
            })
          }, 500)
        },
      })
    this._cdRef.detectChanges();
  }

  getTransactionOneForReverse() {
    this.paymentService.getTransactionOne(this.activatedRoute.snapshot.queryParamMap.get('transactionId') as string).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (templateDetails: any) => {
          this.signForm.patchValue({
            recipient: {
              account: templateDetails.sender.account,
              codeFilial: templateDetails.sender.codeFilial,
              tax: templateDetails.sender.tax,
              name: templateDetails.sender.name,
              pinfl: templateDetails.sender.pinfl,
              innOrPnfl: templateDetails?.recipient.tax ?? templateDetails.recipient.pinfl,
              bankName: templateDetails.sender.bankName,
            },
          })
        },
        error: () => {
          const transaction = JSON.parse(localStorage.getItem("transaction") as string);
          this.signForm.patchValue({
            recipient: {
              account: transaction.sender.account,
              codeFilial: transaction.sender.codeFilial,
              tax: transaction.sender.tax,
              name: transaction.sender.name,
              pinfl: transaction.sender.pinfl,
              innOrPnfl: transaction?.recipient.tax ?? transaction.recipient.pinfl,
              bankName: transaction.sender.bankName,
            },
          })
        },
      })
  }

  getTransactionPreError() {
    this.paymentService.getTransactionPreError(this.activatedRoute.snapshot.queryParamMap.get('transactionId') as string).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (templateDetails: any) => {
          setTimeout(() => {
            const account = this.accounts.find(acc => acc.altAcctId === templateDetails.sender.account);
            if (account) {
              this.choosedAcount.set(account)
            }
            this.massDocDate.set(templateDetails.docNum);
            this.errorMessage.set(templateDetails.errorMessage);
            this.signForm.patchValue({
              saldo: templateDetails.isDebit ?
                { amount: templateDetails.senderAmount.amount / 100 } :
                { amount: templateDetails.receiverAmount.amount / 100 },
              balance: templateDetails.isDebit ?
                { amount: templateDetails.senderAmount.amount / 100 } :
                { amount: templateDetails.receiverAmount.amount / 100 },
              description: templateDetails.description,
              eptRequirementKindCode: this.eptRequirementKindFromAdditionalInfo(templateDetails.additionalInfo),
              eptKartotekaPurposeCode: this.eptKartotekaPurposeCodeFromAdditionalInfo(templateDetails.additionalInfo),
              sender: {
                account: account ? this.accounts[0] : this.choosedAcount(),
                pinfl: templateDetails.sender.pinfl,
              },
              docNum: templateDetails.docNum,
              isAnor: templateDetails.type === '321',
              recipient: {
                account: templateDetails.recipient.account,
                codeFilial: templateDetails.recipient.codeFilial,
                tax: templateDetails.recipient.tax,
                name: templateDetails.recipient.name,
                pinfl: templateDetails.recipient.pinfl,
                innOrPnfl: templateDetails?.recipient.tax ?? templateDetails.recipient.pinfl,
                bankName: templateDetails.recipient.bankName,
              },
              name: templateDetails.name,
              purpose: {
                name: templateDetails.purpose.name,
                code: templateDetails.purpose.code,
              },
            })
            this.bankName = templateDetails.recipient.bankName;
          }, 500)
        },
      })
  }

  getTransactionOneForRepeat() {
    this.paymentService.getTransactionOne(this.activatedRoute.snapshot.queryParamMap.get('transactionId') as string).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (templateDetails: any) => {
          setTimeout(() => {
            console.log(1000012, templateDetails)
            const account = this.accounts.find(acc => acc.altAcctId === templateDetails.sender.account);
            if (account) {
              this.choosedAcount.set(account)
            }
            console.log(1000211,account )
            this.signForm.patchValue({
              saldo: templateDetails.isDebit ?
                { amount: templateDetails.senderAmount.amount / 100 } :
                { amount: templateDetails.receiverAmount.amount / 100 },
              balance: templateDetails.isDebit ?
                { amount: templateDetails.senderAmount.amount / 100 } :
                { amount: templateDetails.receiverAmount.amount / 100 },
              description: templateDetails.description,
              eptRequirementKindCode: this.eptRequirementKindFromAdditionalInfo(templateDetails.additionalInfo),
              eptKartotekaPurposeCode: this.eptKartotekaPurposeCodeFromAdditionalInfo(templateDetails.additionalInfo),
              sender: {
                account: account ? this.accounts[0] : this.choosedAcount(),
                pinfl: templateDetails.recipient.pinfl,
              },
              // isAnor: templateDetails.type === '321',
              recipient: {
                account: templateDetails.sender.account,
                codeFilial: templateDetails.sender.codeFilial,
                tax: templateDetails.sender.tax,
                name: templateDetails.sender.name,
                pinfl: templateDetails.sender.pinfl,
                innOrPnfl: templateDetails?.sender.tax ?? templateDetails.sender.pinfl,
                bankName: templateDetails.sender.bankName,
              },
              name: templateDetails.name,
              purpose: {
                name: templateDetails.purpose.name,
                code: templateDetails.purpose.code,
              },

            })



            if (this.activatedRoute.snapshot.queryParamMap.get('mode') === 'transaction') {
              this.signForm.patchValue({
                docNum: templateDetails.docNum
              })
            }
            this.bankName = templateDetails.recipient.bankName;
          }, 500)
        },
      })
  }

  updateForm(transaction: any) {
    if (!transaction) return;

    if (transaction.status === 'SAVED') {
      this.templateName = transaction.name;
    }

    this.signForm.patchValue({
      ...transaction,
      saldo: {
        amount: (transaction.senderAmount.amount / 100),
        currency: transaction.senderAmount.currency
      },
      recipient: {
        ...transaction.recipient,
      }
    });
    this.templateLoaded = true;
  }


  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedAccount'] && changes['selectedAccount'].currentValue !== undefined) {
      this.setSenderAccount(changes['selectedAccount'].currentValue);
    }
    if (changes['docNum'] && changes['docNum'].currentValue !== undefined) {
      this.signForm.patchValue({
        docNum: changes['docNum'].currentValue
      });
    }
    if (changes['docDate'] && changes['docDate'].currentValue !== undefined) {
      this.signForm.patchValue({
        docDate: changes['docDate'].currentValue
      });
    }
    if (changes['editPayment'] && changes['editPayment'].currentValue) {
      this.updateForm(this.editPayment);
    }
  }

  getReceiverAccount(account?: string | any) {
    if (!account || account?.length === 20 || this.tempAccount) {

      const branchCode = this.signForm.getRawValue().recipient.codeFilial;
      this.paymentService.getAccountReferenceV2({
        page: 0,
        size: 20,
        account: account || this.tempAccount || null,
        // codeFilial: branchCode.length === 5 ? branchCode : null
      }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
        if (!res || !res.content.length) return;
        this.receiverAccounts = res.content;
        const acc = res.content[0];
        console.log(acc, "acc3")
        console.log(account, "a3")
        if (account?.length === 20 && acc) {
          console.log("if")
          this.setReceiverAccount(acc);
        }
        this._cdRef.markForCheck();
      });
    }
  }

  setReceiverAccount(event: any) {
    console.log(event, 'av')
    if (event.recipientAccountNumber) {
      this.tempAccount = event.recipientAccountNumber;
      this.signForm.patchValue({
        recipient: {
          account: event.recipientAccountNumber,
          tax: event.inn,
          innOrPnfl: event.inn,
          name: event.recipientName,
        }
      });
    }
  }

  setSenderAccount(senderAccount: any) {
    this.signForm.patchValue({
      sender: {
        account: senderAccount.altAcctId,
      }
    });
  }

  getBankInfo(bankMfo: string) {
    if (bankMfo) {
      this.accountsPaymentService.getBankInfo(bankMfo)
        .pipe(
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe(val => {
          if (val) {
            this.setBankName(val);
          }
        })
    }
  }

  getAccountInfo(accountNumber: string) {
    if (!this.templateLoaded) {
      const branchCode = this.signForm.getRawValue().recipient.codeFilial;
      this.paymentService.getAccountReference({
        page: 0,
        size: 20,
        account: accountNumber,
        // codeFilial: branchCode.length === 5 ? branchCode : null,
      })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (res) => {
            if (res?.content?.length) {
              const acc = res?.content[0];
              if (acc.inn) {
                this.signForm.patchValue({
                  recipient: {
                    tax: acc.inn,
                  }
                });
              }
              if (acc?.recipientName) {
                this.signForm.patchValue({
                  recipient: {
                    name: acc.recipientName,
                  }
                });
              }
              this._cdRef.markForCheck();
            }
          }
        })
    }
    this.templateLoaded = false;
  }

  setBankName(val: any) {
    this.signForm.patchValue({
      recipient: {
        bankName: val.bankBranchName,
      }
    });
    this._cdRef.markForCheck();
  }

  displayOption(option: any) {
    if (option) {
      return `${option.code} - ${option.name}`;
    }
    return '';
  }

  scrollPurpose() {
    if (this.purposes.length < this.purposeSize) {
      return;
    }
    this.purposePage++;
    this.getPurposes(false);
  }

  searchPurpose(searchText: any) {
    if (searchText.target.value?.length === 5) {
      this.searchPurposeText.set(searchText.target.value);
      const findArray = this.purposes.filter(purpose => purpose.key === searchText.target.value)
      if (findArray?.length === 0) {
        this.signForm.get('recipient.codeFilial')?.setErrors(null)
      } else {
        this.purposesAfterFilter.set(this.purposes.filter(purpose => purpose.key === searchText.target.value))
      }
    } else {
      this.searchPurposeText.set(searchText.target.value);
      this.purposesAfterFilter.set(this.purposes)
    }
  }
  getPurposes(fromInput: boolean) {
    this.paymentService.getPurposes(
      {
        page: this.purposePage,
        size: this.purposeSize,
        searchText: "",
      }
    ).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ((res) => {
          if (fromInput) {
            if (res?.content && res?.content?.length > 0) {
              this.purposeSelect(res?.content[0])
            } else {
              this.purposeSelect({})
              this.signForm.get('purpose')?.markAsTouched();
              this.signForm.get('purpose')?.updateValueAndValidity();
            }
          } else {
            const content = res?.content
            if (content && Array.isArray(content)) {
              if (this.purposePage === 0) {
                this.purposes = content;
              } else {
                this.purposes = [...this.purposes, ...content];
              }
            }
          }
        }),
        complete: () => {
          this._cdRef.markForCheck();
        }
      })
  }

  processFoundReference(data: BudgetReferenceContentDto) {
    this.signForm.patchValue({
      recipient: {
        codeFilial: data?.branchCode,
        tax: data?.inn,
        innOrPnfl: data?.inn,
        name: data?.recipientName,
      }
    })
    this.bankName = data?.filialName
  }

  getAccountReferences(account: string) {
    this.paymentService.getAccountReferenceV2({
      account: account,
      page: 0,
      size: 100
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
      if (!res || !res.content) return;
      const foundReference = res.content.find(item => item.recipientAccountNumber === account);
      if (foundReference) {
        this.processFoundReference(foundReference);
      } else {
        console.log('Reference not found');
      }
      this._cdRef.markForCheck();
    });
  }

  getReferences(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const accountValue = inputElement.value;
    this.getAccountReferences(accountValue);
  }


  // convertAmountIntoWords() {
  //   if (this.signForm.getRawValue().saldo.amount > (this.signForm.getRawValue().sender.account.saldo.amount)) {
  //     this.signForm.patchValue({
  //       saldo: {
  //         amount: this.signForm.getRawValue().sender.account.saldo.amount,
  //       }
  //     })
  //   }
  //   const amount = this.signForm.getRawValue().saldo.amount;
  //   if(amount) {
  //     this.amountInWords = this.amountsService.numberToWordsRU(amount);
  //   } else {
  //     this.amountInWords = '';
  //   }
  // }

  convertAmountIntoWords() {
    const formValue = this.signForm.getRawValue();
    const entered = this.parseNumber(formValue?.balance?.amount ?? 0);
    const max = this.parseNumber(this.choosedAcount().balance?.amount
      ? this.choosedAcount().balance.amount / 100
      : 0);

    let validAmount = entered;
    if (entered > max) {
      this.balanceErrorOver = "На счёте недостаточно средств";
    } else {
      this.balanceErrorOver = "";
    }

    if (validAmount) {
      this.amountInWords = this.amountsService.numberToWordsRU(validAmount);
    } else {
      this.amountInWords = '';
    }
  }

  private parseNumber(value: any): number {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;

    const normalized = value.toString().replace(/\s/g, '').replace(',', '.');
    return parseFloat(normalized) || 0;
  }

  createTemplate() {
    this.signForm.markAllAsTouched();
    if (this.signForm.invalid) {
      this.signForm.markAllAsTouched();
      return;
    }
    if (!this.templateName) {
      this.templateError = true;
      return;
    }
    this.checkTouchedSender();
    const amount = this.signForm.getRawValue().balance.amount;
    const amountInCents = Math.round(amount * 100);
    this.accountService.getOperDayNew().pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const date = new Date(this.signForm.value.docDate);

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        const formatted = `${day}.${month}.${year}`;
        this.signForm.patchValue({
          saldo: {
            amount: amountInCents
          },
          docDate: formatted,
          isSaved: true,
          name: this.templateName,
          recipient: {
            bankName: this.bankName,
            tax: this.signForm.value.recipient.innOrPnfl.length === 9  ? this.signForm.value.recipient.innOrPnfl : null,
            pinfl: this.signForm.value.recipient.innOrPnfl.length === 14 ? this.signForm.value.recipient.innOrPnfl : null,
          },
          sender: {
            account: this.choosedAcount().altAcctId,
            codeFilial: this.businessInfo.mainFilial,
            tax: this.businessInfo.inn,
            name: this.businessInfo.name
          }
        })
        const formValue = { ...this.signForm.getRawValue() };
        this.applyEptAdditionalInfoToPayload(formValue);
        delete formValue.detail;
        delete formValue.balance
        delete formValue.isAutoPay;
        delete formValue.isAnor;
        delete formValue.innOrPnfl;
        this.utilsService.spinnerState$$.next(true);
        this.paymentService.createTemplate(formValue, '', this)
      })
    // const body = this.signForm.getRawValue();
    // body.sender.account = this.selectedAccount?.altAcctId;
    // body.saldo.amount = Math.round(this.signForm.getRawValue().saldo.amount * 100);
    // delete body.purpose.purposeType;
    // body.purpose.code = body.purpose.code.trim();
    //
    // this.paymentService.createTemplate(body, name);
  }



  async getDocDate(): Promise<void> {
    const res = await firstValueFrom(this.accountService.getOperDayNew());

    const [day, month, year] = res.operDay.split('.').map(Number);
    const formattedDate = new Date(year, month - 1, day);
    this.signForm.patchValue({ docDate: formattedDate });
    this.docDate = formattedDate;
    this.minDate.set(formattedDate);
  }


  checkCode() {
    const findPurpose = this.purposes.find(purpose => purpose.code === this.purposeCodeForCheck);
    if (!findPurpose) {
      this.signForm.get('purpose.name')?.markAsTouched()
    }
  }

  chooseAccFunc(account) {
    this.choosedAcount.set(account);
    this.convertAmountIntoWords();
  }

  submit() {
    const mode = this.activatedRoute.snapshot.queryParamMap.get('mode');
    if (mode === 'mass') {
      // this.submitPrepareUzsTransaction();
      return;
    }
    this.submitCreateEptBankMailDocument();
  }

  private buildCreateEptBankMailPayload(): CreateEptBankMailDocumentPayload | null {
    const raw = this.signForm.getRawValue();
    console.log(32323232, raw)

    const purposeCode = raw.purpose?.code;
    const purposeName = raw.purpose?.name;
    if (purposeCode == null || purposeCode === '' || !purposeName) {
      this.toastrService.error('Укажите код назначения');
      return null;
    }

    const kartCode = raw.eptKartotekaPurposeCode;
    const kart = this.purposesEptUnpaid.find(p => p.code === kartCode);
    if (!kart?.code) {
      this.toastrService.error('Выберите назначение требования по картотеке');
      return null;
    }

    // const innOrPnfl = (raw.recipient?.innOrPnfl ?? '').toString().trim();
    // const payeeInn = innOrPnfl.length === 9 ? innOrPnfl : '';
    // const payeePin = innOrPnfl.length === 14 ? innOrPnfl : '';

    const rawDocDate = raw.docDate;
    const date = rawDocDate instanceof Date ? rawDocDate : new Date(rawDocDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const formatted = `${day}.${month}.${year}`;

    const payerAccount = this.choosedAcount()?.altAcctId;
    if (!payerAccount) {
      this.toastrService.error('Выберите счёт зачисления');
      return null;
    }

    const amt = this.parseNumber(raw.balance?.amount ?? 0);
    const docNumRaw = raw.docNum;
    const docNum = typeof docNumRaw === 'number' ? docNumRaw : Number(String(docNumRaw ?? '').replace(/\D/g, '')) || 0;
    const transactionIdItem = (this.activatedRoute.snapshot.queryParamMap.get('mode') === 'transaction') ? (this.activatedRoute?.snapshot?.queryParamMap?.get('transactionId'))  : undefined;
    return {
      id:  (transactionIdItem ?? '').toString(),
      detail: (raw.description ?? '').toString(),
      docDate: formatted,
      docNumber: docNum,
      payeeAccount: String(payerAccount),
      payeeBranch: (this.businessInfo?.filialCode ?? '').toString(),
      payeeInn: (this.businessInfo?.inn ?? '').toString(),
      payeeName: (this.businessInfo?.name ?? '').toString(),
      payeePin: (this.businessInfo?.pinfl ?? '').toString(),
      payerAccount: (raw.recipient?.account ?? '').toString(),
      payerBranch: (raw.recipient?.codeFilial ?? '').toString(),
      payerInn: (raw?.recipient?.innOrPnfl ?? '').toString(),
      payerName: (raw.recipient?.name ?? '').toString(),
      paymentType: (raw.eptRequirementKindCode ?? '').toString(),
      purpose: { code: String(purposeCode), name: String(purposeName) },
      summa: amt ? amt * 100 : 0,
      unpaid: String(kart.code),
    };
  }

  private submitCreateEptBankMailDocument(): void {
    this.signForm.markAllAsTouched();
    if (this.signForm.invalid) {
      return;
    }
    if (this.balanceErrorOver.length > 0) {
      return;
    }
    this.checkTouchedSender();
    const payload = this.buildCreateEptBankMailPayload();
    if (!payload) {
      return;
    }
    this.utilsService.spinnerState$$.next(true);
    this.paymentService.createEptBankMailDocument(payload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        this.utilsService.spinnerState$$.next(false);
        if (res !== null && res !== undefined) {
          // this.toastrService.success('Требование создано');
          // this.router.navigate(['/EPT']);
          const raw = this.signForm.getRawValue();
          const amt = this.parseNumber(raw.balance?.amount ?? 0);
          this.matDialog.open(PaymentSuccessModalComponent, {
            data: {
              windowType: 'CREATE_EPT',
              transactionMode: 'CREATE_EPT',
              // mode: 'edit',
              saldo: {
                amount: amt ? amt * 100 : 0,
              },
              recipient: {
                name: (raw.recipient?.name ?? '').toString()
              },
              transactionId: res?.id,
            }
          });

        }
        this._cdRef.markForCheck();
      },
      error: (err: Error) => {
        this.utilsService.spinnerState$$.next(false);
        this.toastrService.error(err?.message || 'Ошибка');
      }
    });
  }

  // private submitPrepareUzsTransaction(): void {
  //   const isNeedAutoPay = this.docDate < this.signForm.value.docDate;
  //   this.signForm.markAllAsTouched();
  //   if (this.signForm.invalid) {
  //     this.signForm.markAllAsTouched();
  //     return;
  //   }
  //   if (this.balanceErrorOver.length > 0) {
  //     return;
  //   }
  //   this.utilsService.spinnerState$$.next(true);
  //   this.checkTouchedSender();
  //   const rawDocDate = this.signForm.value.docDate;
  //   const date = new Date(rawDocDate);
  //
  //   const nextDate = new Date(date);
  //   nextDate.setDate(nextDate.getDate() + 1);
  //
  //
  //   const day = String(date.getDate()).padStart(2, '0');
  //   const month = String(date.getMonth() + 1).padStart(2, '0');
  //   const year = date.getFullYear();
  //   const formatted = `${day}.${month}.${year}`;
  //
  //   const amount = this.signForm.getRawValue().balance.amount;
  //   const amountInCents = Math.round(amount * 100);
  //   this.signForm.patchValue({
  //     saldo: {
  //       amount: amountInCents,
  //     },
  //     // docDate: formatted,
  //     recipient: {
  //       bankName: this.bankName,
  //       tax: this.signForm.value.recipient.innOrPnfl.length === 9  ? this.signForm.value.recipient.innOrPnfl : null,
  //       pinfl: this.signForm.value.recipient.innOrPnfl.length === 14 ? this.signForm.value.recipient.innOrPnfl : null,
  //     },
  //     type: this.signForm.value.isAnor ? "321" : "121",
  //     // isAnor: true,
  //     isAutoPay: isNeedAutoPay,
  //     sender: {
  //       account: this.choosedAcount().altAcctId,
  //       codeFilial: this.businessInfo.mainFilial,
  //       tax: this.businessInfo.inn,
  //       name: this.businessInfo.name
  //     }
  //   })
  //   const formValue = { ...this.signForm.getRawValue(), docDate: formatted };
  //   this.applyEptAdditionalInfoToPayload(formValue);
  //   delete formValue.detail;
  //   delete formValue.balance
  //   delete formValue.isAnor;
  //   delete formValue.withAnor;
  //   delete formValue.recipient.innOrPnfl;
  //   if (isNeedAutoPay) {
  //     formValue.autoPayCreateReq = {
  //       months: [Number(month)],
  //       notificationBeforeTime: "FIVE_MINUTE",
  //       days: [],
  //       dateEnd: nextDate.toISOString(),
  //       paymentTime: "07:00",
  //       withNotification: true,
  //       paymentDay: Number(day),
  //       paymentFrequency: "MONTHLY"
  //     };
  //   }
  //   // this.utilsService.spinnerState$$.next(true);
  //   this.paymentService.createTransaction(formValue, 'SAVE', '', this)
  // }

  editTransaction() {
    // this.checkPaymentAllowed();
    this.signForm.markAllAsTouched();
    if (this.signForm.invalid) {
      this.signForm.markAllAsTouched();
      return;
    }
    if (this.balanceErrorOver.length > 0) {
      return;
    }
    this.checkTouchedSender();
    // if (this.signForm.valid) {
    //   this.checkPaymentAllowed();
    // }
    const rawDocDate = this.signForm.value.docDate;
    const date = new Date(rawDocDate);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const formatted = `${day}.${month}.${year}`;
    const amount = this.signForm.getRawValue().balance.amount;
    const amountInCents = Math.round(amount * 100);
    this.signForm.patchValue({
      saldo: {
        amount: amountInCents
      },
      // docDate: formatted,
      recipient: {
        bankName: this.bankName,
        tax: this.signForm.value.recipient.innOrPnfl.length === 9  ? this.signForm.value.recipient.innOrPnfl : null,
        pinfl: this.signForm.value.recipient.innOrPnfl.length === 14 ? this.signForm.value.recipient.innOrPnfl : null,
      },
      sender: {
        account: this.choosedAcount().altAcctId,
        codeFilial: this.businessInfo.mainFilial,
        tax: this.businessInfo.inn,
        name: this.businessInfo.name
      },
      withAnor: this.signForm.value.isAnor
    })
    const formValue = { ...this.signForm.getRawValue() };
    this.applyEptAdditionalInfoToPayload(formValue);
    delete formValue.detail;
    delete formValue.balance
    delete formValue.isAnor;
    delete formValue.isAutoPay;
    delete formValue.isSaved;
    delete formValue.type;
    delete formValue.recipient.innOrPnfl;
    delete formValue.windowType;
    delete formValue.transactionMode;
    this.utilsService.spinnerState$$.next(true);
    this.paymentService.editTemplateReq(formValue, (this.activatedRoute.snapshot.queryParamMap.get('transactionId') as string), 'transaction')
  }

  editTemplate() {
    if (!this.templateName) {
      this.templateError = true;
      return;
    }
    const date = new Date(this.signForm.value.docDate);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    const formatted = `${day}.${month}.${year}`;
    const amount = this.signForm.getRawValue().balance.amount;
    const amountInCents = Math.round(amount * 100);

    const taxValue = (this.signForm.get('recipient.innOrPnfl')?.value ?? '').toString();

    this.signForm.patchValue({
      saldo: {
        amount: amountInCents
      },
      docDate: formatted,
      isSaved: true,
      name: this.templateName,
      recipient: {
        bankName: this.bankName,
        tax: taxValue.length === 9  ?taxValue : undefined,
        pinfl: taxValue.length === 14 ? taxValue.tax : undefined,
      },
      sender: {
        account: this.choosedAcount().altAcctId,
        codeFilial: this.businessInfo.mainFilial,
        tax: this.businessInfo.inn,
        name: this.businessInfo.name
      }
    })
    const formValue = { ...this.signForm.getRawValue() };
    this.applyEptAdditionalInfoToPayload(formValue);
    delete formValue.detail;
    delete formValue.balance
    delete formValue.isAnor;
    delete formValue.isSaved;
    delete formValue.isAutoPay;
    delete formValue.type;
    delete formValue.recipient.innOrPnfl;
    delete formValue.windowType;
    delete formValue.transactionMode;
    this.paymentService.editTemplateReq(formValue, this.templateId);
  }

  checkTouchedSender() {
    const invalid = this.signForm.get('sender.account')?.invalid;
    const touched = this.signForm.get('sender.account')?.touched;
    const res = Boolean(invalid && touched);
    this.senderAccountTouched.emit(res);

  }

  selectAction(action: any) {
    if (action.value === 'create') {
      this.submit();
    } else if (action.value === 'send') {
      // this.submit('SEND');
    }
  }

  protected readonly transactionModes = TransactionModes;
  protected readonly Number = Number;
  protected readonly console = console;
  protected readonly setTimeout = setTimeout;
}
