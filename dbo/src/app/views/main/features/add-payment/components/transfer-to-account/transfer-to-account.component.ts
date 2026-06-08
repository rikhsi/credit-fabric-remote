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
import { UtilsService } from "../../../../../../core/services/utils.service";
import { AmountService } from "../../../../../../core/services/amount.service";
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule, ValidationErrors,
  ValidatorFn,
  Validators
} from "@angular/forms";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { AutoPayForm } from "../../../create-autopay/interfaces/auto-pay.interface";
import { PaymentService } from "../../../../../../core/services/payment.service";
import { AccountsPaymentsService } from "../../../accounts-payments/services/accounts-payments.service";
import { AccountService } from "../../../../../../core/services/account.service";
import { ToastrService } from "ngx-toastr";
import { AutopayService } from "../../../../../../core/services/autopay.service";
import { TransactionOneDetailDto } from "../../../../../../core/models/transaction.models";
import {debounceTime, distinctUntilChanged, firstValueFrom, Subject, take} from "rxjs";
import { TransactionModes } from "../../../../../auth/constants/transaction-list.const";
import { MfoModalComponent} from "../../modals/mfo-modal/mfo-modal.component.component";
import { UserInfoDto } from "../../../../../../core/models/user.model";
import { AccountsDto, BudgetReferenceContentDto } from "../../../accounts-payments/models/accounts-payments.model";
import { animate, style, transition, trigger } from "@angular/animations";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {SpinnerComponent} from "../../../../../../core/components/spinner/spinner.component";
import {FirebaseAnalyticsService} from "../../../../../../../../firebase-analytics.service";
import {TransactionService} from "../../../../../../core/services/transaction.service";
import {InfoModalComponent} from "../../../kartoteka/kartoteka-2/components/info-modal/info-modal.component";
import { NumericOnlyDirective } from "src/app/shared/directives/numeric-only.directive";
import {environment} from "../../../../../../../environments/environment";
import {CancelModalComponent} from "../../../template-transactions/components/cancel-modal/cancel-modal.component";

export interface Balance {
  amount: number;
  scale: number;
  currency: string;
  logo: string | null;
}

export interface Account {
  id: string;
  accountTitle: string;
  accountType: string;
  altAcctId: string;
  balance: Balance;
  isTransactionAllowed: boolean;
  openDate: string;
  saldoUnlead: number | null;
  status: string;
}
@Component({
  selector: 'app-transfer-to-account',
  imports: [ NumericOnlyDirective, CommonModule, MatTooltipModule, MatDatepickerModule, MatFormFieldModule, MatInputModule, MatNativeDateModule, RouterModule, ReactiveFormsModule, NgxMaskDirective, NgxMaskPipe, FormsModule, TranslateModule, SpinnerComponent],
  templateUrl: './transfer-to-account.component.html',
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
export class TransferToAccountComponent implements OnInit {
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
  bronAndReserves = signal<any[]>([])
  templateList = signal<any[]>([])
  spinnerState = signal<boolean>(false);
  mfoMissed = signal<boolean>(false);
  isIdentical = signal<boolean>(false);
  mfoFound = signal<boolean>(false);
  errorMessage = signal<string>('');
  searchText = signal<string>('');
  descText = signal<string>('');
  private dialogRef: MatDialogRef<MfoModalComponent> | null = null;
  inputSubject = new Subject<any>();
  docNumSubject = new Subject<any>();
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
    description: new FormControl("", [Validators.required, Validators.maxLength(450), this.descIdentityValidator()]),
    docNum: new FormControl(''),
    docDate: new FormControl(null, Validators.required),
    isAnor: new FormControl(false),
    withAnor: new FormControl(false),
    isSaved: new FormControl(false),
    neotlojka: new FormControl(false),
    bron: new FormControl(false),
    isAutoPay: new FormControl(false),
    sender: new FormGroup({
      // accountToForm: new FormControl('', Validators.required),
      account: new FormControl(''),
      pinfl: new FormControl(null),
    }),
    name: new FormControl(''),
    windowType: new FormControl('TRANSACTION'),
    transactionMode: new FormControl('TRANSACTION'),
    recipient: new FormGroup({
      account: new FormControl('', [Validators.minLength(20), Validators.maxLength(27), Validators.required]),
      codeFilial: new FormControl('', [Validators.minLength(5), Validators.maxLength(5), Validators.required]),
      tax: new FormControl(null),
      name: new FormControl('', Validators.required),
      pinfl: new FormControl(null),
      bankName: new FormControl(''),
      innOrPnfl: new FormControl('', [Validators.required, this.innOrPnflValidator()]),
    }),
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
    private translate: TranslateService,
    private transactionService: TransactionService,
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
   const type = this.activatedRoute.snapshot.queryParamMap.get('type');
   const isKartoteka = this.activatedRoute.snapshot.queryParamMap.get('isKartoteka');
   const kartotekaType = this.activatedRoute.snapshot.queryParamMap.get('kartotekaType');
   const mode = this.activatedRoute.snapshot.queryParamMap.get('mode');

   try {
     const query = await firstValueFrom(this.activatedRoute.queryParams.pipe(take(1)));

     if (type === 'edit' || type === 'createFromTemplate') {
       await this.getTemplateDetails(query["templateId"]);
       this.templateName = query["templateName"];
       this.templateId = query["templateId"];
     }
     if (isKartoteka === 'kartoteka') {
       this.getKartotekaData();
     }
     if (kartotekaType) {
       this.signForm.patchValue({
         bron: kartotekaType === 'bron',
         neotlojka: kartotekaType === 'neotlojka',
       })
     }
     if (type === 'reverse') {
       this.getTransactionOneForReverse();
     }

     if (type === 'repeat' || mode === 'transaction') {
       this.getTransactionOneForRepeat();
     }
     if (mode === 'mass') {
       this.getTransactionPreError()
     }
     await Promise.all([
       this.getAccountDataFromQuearyParams(),
       this.getDocDate(),
       this.getDocNumber(),
       this.getPurposeList(),
       this.getPurposeText(),
     ]);
   } catch (e) {
   } finally {
     this.spinnerState.set(false);
     this._cdRef.detectChanges();
   }
    this.inputSubject
      .pipe(debounceTime(800), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((val) => {
        this.purposeCode = val.target.value
        this.getPurposeList();
        this.openFindPurposes = true;
      });
   this.docNumSubject
      .pipe(debounceTime(1000), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((val) => {
        this.checkDocNum(val)
      });
   this.inputAccSubject.pipe(debounceTime(800), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
     .subscribe((val) => {
       this.getReferences(val)
     });
   this.inputTaxSubject
     .pipe(takeUntilDestroyed(this.destroyRef))
     .subscribe((event) => {
       this.onTaxInput(event);
     });

    this.businessInfo = JSON.parse(localStorage.getItem("businessInfo") as string);

   this.signForm.get('description')?.valueChanges.subscribe(() => {
     this.isIdentical.set(false);
   });

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
              if (!res) {
                this.mfoFound.set(true);
              } else {
                this.mfoFound.set(false);
              }
              this.bankName = res?.bankBranchName
              this._cdRef.detectChanges();
            },
            error: () => {
              this.mfoFound.set(true);
            },
            complete: () => {
              this._cdRef.markForCheck();
            }
          })
      });
  }

  private descIdentityValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return control.value === this.descText()
        ? { identical: true }
        : null;
    };
  }

  checkKartatotka(type) {
    if (type === 'BRON') {
      this.signForm.patchValue({
        neotlojka: false,
        bron: true,
      })
    } else {
      this.signForm.patchValue({
        neotlojka: true,
        bron: false,
      })
    }
  }


  integerPart(balance): string {
    const amount = (balance ?? 0) / 100;
    const [int] = amount.toFixed(2).split('.');
    return Number(int).toLocaleString().replace(/,/g, ' ');
  }

  decimalPart(balance): string {
    const amount = (balance ?? 0) / 100;
    const [, dec] = amount.toFixed(2).split('.');
    return dec;
  }

  getKartotekaData() {
    const kartotekaType = this.activatedRoute.snapshot.queryParamMap.get('kartotekaType');
    const mode = this.activatedRoute.snapshot.queryParamMap.get('mode');
    this.transactionService.checkKartoteka('TRANSACTION').pipe().subscribe((res: any) => {
      this.bronAndReserves.set(res?.data);

        if (kartotekaType && kartotekaType === 'bron') {
          const filteredRes = res?.data.find((item: any) => item.amountType === 'BRON');
          if (mode !== 'transaction' && mode !== 'repeat') {
            this.signForm.patchValue({
              bron: true,
            })
          }
          setTimeout(() => {
            const acc = this.accounts.find(item => item.altAcctId === filteredRes.accountNumber);
            this.choosedAcount.set(acc);
          }, 1000)
        } else {
          const filteredRes = res?.data.find((item: any) => item.amountType === 'NEOTLOJKA');
          if (mode !== 'transaction' && mode !== 'repeat') {
            this.signForm.patchValue({
              neotlojka: true,
            })
          }
          setTimeout(() => {
            const acc = this.accounts.find(item => item.altAcctId === filteredRes.accountNumber);
            this.choosedAcount.set(acc);
          }, 1000)
        }
    })
  }

  mfoCheckFunc() {
    console.log(this.bankName, "b")
    if (this.bankName.length === 0) {
      this.mfoMissed.set(true)
    } else {
      this.mfoMissed.set(false)
    }
  }

  innOrPnflValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const isValid = /^\d{9}$/.test(value) || /^\d{14}$/.test(value);
      return isValid ? null : { innOrPnfl: true };
    };
  }

  onTaxInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const numericValue = input.value.replace(/\D/g, '');

    if (input.value !== numericValue) {
      input.value = numericValue;
      this.signForm.get('recipient.innOrPnfl')?.setValue(numericValue, { emitEvent: false });
    }
    this.getAccountReferences(numericValue);
  }

  async getAccountDataFromQuearyParams(): Promise<void> {
    const params = await firstValueFrom(
      this.activatedRoute.queryParams.pipe(take(1))
    );
    await this.getAccounts1();
    await this.getTemplates();
    if (params['account']) {
      try {
        const account = JSON.parse(decodeURIComponent(params['account']));
        if (account.status === 'BLOCKED') {
          return;
        }
        this.chooseAccFunc(account);
        this.signForm.get('sender')?.get('account')?.setValue(account.altAcctId);
        this.selectedAccountData.set(account);
        this.accounts = [account];

      } catch (e) {
        console.error('failed to parse account from query param', e);
      }
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
        searchText: this.purposeCode
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

    if (acc.status === 'BLOCKED' || this.fromQuery === 'template-payment') {
      this.getAccount(account);
    } else if (acc) {
      this.selectSenderAccount(acc);
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
    const res = await firstValueFrom(
      this.accountsPaymentService.getTransactionListV2(
        { size: 10, page: 0 },
        {
          toAmount: null,
          fullHistory: true,
          statuses: ["SAVED"],
          inn: null,
          fromAmount: 0,
          docNum: null,
          transactionModes: null,
          currency: null,
          windowType: ["TRANSACTION"],
          endDate: null,
          type: "ANY",
          foreignCurrency: null,
          senderAccount: null,
          parentId: null,
          receiverName: null,
          transactionStepFilter: null,
          searchText: "",
          startDate: null,
          receiverAccount: null
        }
      )
    );

    if (res?.content) {
      let list = res.content;

      if (this.selectedAccountData()) {
        list = list.filter(c => c.sender.account === this.selectedAccountData()?.altAcctId);
      }

      this.templateList.set(list);
    }
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
    } else {
      this.router.navigate(['payment'])
    }
  }

  closeToTemplate(mode: string) {
    this.matDialog.open(CancelModalComponent, {
      maxWidth: "480px",
      width: "480px",
      data: {
        title: mode == 'create' ? "Вы уверены, что хотите отменить создание шаблона?" : 'Вы уверены, что хотите отменить редактирование?',
        desc: "Все введённые данные будут утеряны",
      }
    }).afterClosed().subscribe((res) => {
      if (res === 'close') return
      const returnUrl = this.activatedRoute.snapshot.queryParamMap.get('returnUrl')
      if (returnUrl) {
        this.router.navigateByUrl(returnUrl)
      } else {
        this.router.navigate(['/templates'])
      }
    })
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
            if (account && account?.status === 'BLOCKED') {
              this.choosedAcount.set({})
            } else if (account) {
              this.choosedAcount.set(account)
            }

            this.signForm.patchValue({
              saldo: templateDetails.isDebit ?
                { amount: templateDetails.senderAmount.amount / 100 } :
                { amount: templateDetails.receiverAmount.amount / 100 },
              balance: templateDetails.isDebit ?
                { amount: templateDetails.senderAmount.amount / 100 } :
                { amount: templateDetails.receiverAmount.amount / 100 },
              description: templateDetails.description,
              sender: {
                account: !account ? this.accounts[0] : this.choosedAcount(),
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
              sender: {
                account: !account ? this.accounts[0] : this.choosedAcount(),
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

  async getPurposeText() {
    const res = await firstValueFrom(this.paymentService.getPurposeText('TRANSACTION'))
    this.descText.set(res.formMessage);
    this.signForm.patchValue({
      description: res.formMessage,
    })
  }

  getTransactionOneForRepeat() {
    this.paymentService.getTransactionOne(this.activatedRoute.snapshot.queryParamMap.get('transactionId') as string).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (templateDetails: any) => {
          setTimeout(() => {
            const account = this.accounts.find(acc => acc.altAcctId === templateDetails.sender.account);
            if (account && account?.status !== 'BLOCKED') {
              this.choosedAcount.set(account)
            }
            this.signForm.patchValue({
              saldo: templateDetails.isDebit ?
                { amount: templateDetails.senderAmount.amount / 100 } :
                { amount: templateDetails.receiverAmount.amount / 100 },
              balance: templateDetails.isDebit ?
                { amount: templateDetails.senderAmount.amount / 100 } :
                { amount: templateDetails.receiverAmount.amount / 100 },
              description: templateDetails.description,
              bron: templateDetails.paymentSource === 'BRON',
              neotlojka: templateDetails.paymentSource === 'NEOTLOJKA',
              sender: {
                account: account?.status === 'BLOCKED' ? {} : account?.account ? account : this.choosedAcount(),
                pinfl: templateDetails.sender.pinfl,
              },
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

  cancelTemplateDialog() {
    this.matDialog.open(CancelModalComponent, {
      data: {

      }
    }).afterClosed().subscribe(() => {
      this.templateCreateModal = false;
    })
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
  onTaxKeydown(event: KeyboardEvent) {
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];

    if (!allowedKeys.includes(event.key) && !/^\d$/.test(event.key)) {
      event.preventDefault();
    }
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

  onAmountKeydown(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;

    // Считаем только цифры, без пробелов маски
    const digitsOnly = input.value.replace(/\D/g, '');

    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];

    if (digitsOnly.length >= 16 && !allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  convertAmountIntoWords() {
    const isKartoteka = this.activatedRoute.snapshot.queryParamMap.get('isKartoteka');

    const bronData = this.bronAndReserves()?.find(item => item.amountType === 'BRON');
    const neotlojkaData = this.bronAndReserves()?.find(item => item.amountType === 'NEOTLOJKA');

    const maxAmount = isKartoteka === 'kartoteka' ? (this.signForm.getRawValue().bron ? bronData.amount.amount / 100 : this.signForm.getRawValue().neotlojka ? neotlojkaData.amount.amount / 100 : 0) : this.choosedAcount().balance?.amount
      ? this.choosedAcount().balance.amount / 100
      : 0;

    const formValue = this.signForm.getRawValue();
    const entered = this.parseNumber(formValue?.balance?.amount ?? 0);
    const max = this.parseNumber(maxAmount);

    let validAmount = entered;
    if (entered > max) {
      this.balanceErrorOver = isKartoteka === 'kartoteka' ? (this.signForm.getRawValue().bron ? this.translate.instant('createPayment.warning_bron') :this.translate.instant('createPayment.warning_neotlojki')) : "На счёте недостаточно средств";
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
          },
        })
        const formValue = { ...this.signForm.getRawValue() };
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


  setTemplateToForm(template) {
    this.templateName = template.name;
    const findAccount = this.accounts?.find(account => account.altAcctId === template.sender.account);
    // if (findAccount) {
    this.utilsService.spinnerState$$.next(true);
    this.signForm.patchValue({
      templateId: template.id,
      balance: {
        amount: template.senderAmount.amount / 100,
        scale: template.senderAmount.scale,
        currency: template.senderAmount.currency,
      },
      saldo: {
        amount: template.senderAmount.amount / 100,
        scale: template.senderAmount.scale,
        currency: template.senderAmount.currency,
      },
      description: template.description,
      isAnor: template.isAnor,
      sender: {
        account: this.bronAndReserves()?.length > 0 ? this.choosedAcount() : findAccount?.status === 'BLOCKED' ? {} : findAccount?.account ? findAccount : this.choosedAcount(),
        pinfl: template.sender.pinfl,
      },
      windowType: 'TRANSACTION',
      transactionMode: 'TRANSACTION',
      recipient: {
        account: template.recipient.account,
        codeFilial: template.recipient.codeFilial,
        tax: template.recipient.tax,
        name: template.recipient.name,
        pinfl: template.recipient.pinfl,
        innOrPnfl: template.recipient.tax ?? template.recipient.pinfl,
        bankName: template.recipient.bankName,
      },
      purpose: {
        name: template.purpose.name,
        code: template.purpose.code,
      },
    })
    if (this.bronAndReserves().length > 0 ) {
      this.choosedAcount.set(findAccount)
    } else if (findAccount?.status === 'BLOCKED') {
      this.choosedAcount.set({})
    } else if (findAccount) {
      this.choosedAcount.set(findAccount)
    }
    this.utilsService.spinnerState$$.next(false);
    // }
    // this.getBankInfo(template.recipient.codeFilial);
    this._cdRef.detectChanges();
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

  openKartoteka2Info(type: string) {
    this.matDialog.open(InfoModalComponent, {
      data: {type: type},
      width: "481px",
      minHeight: "426px"
    })
  }

  checkDocNum(value) {
    this.paymentService.checkDocNumber(value?.target.value)
  }

  submit() {
    this.isIdentical.set(this.signForm.get('description')?.value === this.descText());

    const isKartoteka = this.activatedRoute.snapshot.queryParamMap.get('isKartoteka');

    const isNeedAutoPay = this.docDate < this.signForm.value.docDate;
    if (this.signForm.invalid || this.isIdentical()) {
      this.signForm.markAllAsTouched();
      return;
    }
    if (this.balanceErrorOver.length > 0) {
      return;
    }
    this.utilsService.spinnerState$$.next(true);
    this.checkTouchedSender();
    const rawDocDate = this.signForm.value.docDate;
    const date = new Date(rawDocDate);

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);


    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const formatted = `${day}.${month}.${year}`;

    const amount = this.signForm.getRawValue().balance.amount;
    const amountInCents = Math.round(amount * 100);
    this.signForm.patchValue({
      saldo: {
        amount: amountInCents,
      },
      // docDate: formatted,
      recipient: {
        bankName: this.bankName,
        tax: this.signForm.value.recipient.innOrPnfl.length === 9  ? this.signForm.value.recipient.innOrPnfl : null,
        pinfl: this.signForm.value.recipient.innOrPnfl.length === 14 ? this.signForm.value.recipient.innOrPnfl : null,
      },
      type: this.signForm.value.isAnor ? "321" : "121",
      // isAnor: true,
      isAutoPay: isNeedAutoPay,
      sender: {
        account: this.choosedAcount().altAcctId,
        codeFilial: this.businessInfo.mainFilial,
        tax: this.businessInfo.inn,
        name: this.businessInfo.name
      },
    })
    const formValue = { ...this.signForm.getRawValue(), docDate: formatted, paymentSource: isKartoteka === 'kartoteka' ? (this.signForm.getRawValue().neotlojka ? 'NEOTLOJKA' : this.signForm.getRawValue().bron ? 'BRON' :'ACCOUNT'): 'ACCOUNT' };
    delete formValue.detail;
    delete formValue.balance
    delete formValue.isAnor;
    delete formValue.bron;
    delete formValue.neotlojka;
    delete formValue.withAnor;
    delete formValue.recipient.innOrPnfl;
    if (isNeedAutoPay) {
      formValue.autoPayCreateReq = {
        months: [Number(month)],
        notificationBeforeTime: "FIVE_MINUTE",
        days: [],
        dateEnd: nextDate.toISOString(),
        paymentTime: "07:00",
        withNotification: true,
        paymentDay: Number(day),
        paymentFrequency: "MONTHLY"
      };
    }
    // this.utilsService.spinnerState$$.next(true);
    this.paymentService.createTransaction(formValue, 'SAVE', '', this)
  }

  editTransaction() {
    const isKartoteka = this.activatedRoute.snapshot.queryParamMap.get('isKartoteka');
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
    const formValue = {
      ...this.signForm.getRawValue(),
        paymentSource: isKartoteka === 'kartoteka' ? (this.signForm.getRawValue().neotlojka ? 'NEOTLOJKA' : this.signForm.getRawValue().bron ? 'BRON' :'ACCOUNT'): 'ACCOUNT' };
    delete formValue.detail;
    delete formValue.balance
    delete formValue.isAnor;
    delete formValue.isAutoPay;
    delete formValue.isSaved;
    delete formValue.bron;
    delete formValue.neotlojka;
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
