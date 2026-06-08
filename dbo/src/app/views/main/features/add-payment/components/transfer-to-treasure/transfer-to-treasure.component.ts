import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef, EventEmitter,
  HostListener,
  Input,
  OnInit, Output,
  signal
} from "@angular/core";
import {CommonModule} from "@angular/common";
import {ActivatedRoute, Router, RouterModule} from "@angular/router";
import {UtilsService} from "../../../../../../core/services/utils.service";
import {AmountService} from "../../../../../../core/services/amount.service";
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {
  AccountsDto,
  BudgetReferenceContentDto,
  CodePurposeContent
} from "../../../accounts-payments/models/accounts-payments.model";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {AccountsListPaymentsComponent} from "../../modals/account-list-modal/account-list-modal.component";
import {NgxMaskDirective, NgxMaskPipe} from "ngx-mask";
import {UserInfoDto} from "../../../../../../core/models/user.model";
import {AccountService} from "../../../../../../core/services/account.service";
import {AccountsPaymentsService} from "../../../accounts-payments/services/accounts-payments.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {MatFormFieldModule} from "@angular/material/form-field";
import {PaymentService, PurposeTypes} from "../../../../../../core/services/payment.service";
import {ToastrService} from "ngx-toastr";
import {CodePurposeModalComponent} from "../../modals/code-purpose/code-purpose-modal.component";
import {debounceTime, distinctUntilChanged, Subject} from "rxjs";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatInputModule} from "@angular/material/input";
import {MatNativeDateModule} from "@angular/material/core";
import {animate, style, transition, trigger} from "@angular/animations";
import {Account} from "../transfer-to-account/transfer-to-account.component";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {FirebaseAnalyticsService} from "../../../../../../../../firebase-analytics.service";
import {MatTooltip} from "@angular/material/tooltip";
import {TransactionService} from "../../../../../../core/services/transaction.service";
import {InfoModalComponent} from "../../../kartoteka/kartoteka-2/components/info-modal/info-modal.component";
import { NumericOnlyDirective } from "src/app/shared/directives/numeric-only.directive";
import {CancelModalComponent} from "../../../template-transactions/components/cancel-modal/cancel-modal.component";

@Component({
  selector: 'app-transfer-to-account',
  imports: [NumericOnlyDirective,CommonModule, MatDatepickerModule, MatFormFieldModule, MatInputModule, MatNativeDateModule, RouterModule, ReactiveFormsModule, NgxMaskDirective, NgxMaskPipe, FormsModule, TranslateModule, MatTooltip],
  templateUrl: './transfer-to-treasure.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('dropdownAnimation', [
      transition(':enter', [
        style({opacity: 0, transform: 'scaleY(0)'}),
        animate('200ms ease-out', style({opacity: 1, transform: 'scaleY(1)'})),
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({opacity: 0, transform: 'scaleY(0)'})),
      ]),
    ]),
  ]
})
export class TransferToTreasureComponent implements OnInit {
  isOpen = false;
  touched = false;
  selectedAccount!: AccountsDto | null | undefined;
  accounts!: AccountsDto[];
  fromQuery = '';
  templateCreateModal = false;
  @Output() senderAccountTouched = new EventEmitter<boolean>();
  @Input() docDate!: any;
  businessInfo: UserInfoDto | Record<string, any> = {};

  constructor(
    public amountService: AmountService,
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private matDialog: MatDialog,
    private toastrService: ToastrService,
    private accountService: AccountService,
    private destroyRef: DestroyRef,
    private amountsService: AmountService,
    protected activatedRoute: ActivatedRoute,
    private transactionService: TransactionService,
    public router: Router,
    private translate: TranslateService,
    private utilsService: UtilsService,
    private accountsPaymentService: AccountsPaymentsService,
    private _cdRef: ChangeDetectorRef,
    private analyticsService: FirebaseAnalyticsService,
  ) {
  }

  transferForm = this.fb.nonNullable.group({
    template: ''
  });

  amountInWords = '';
  codeInput: boolean = false;
  balanceErrorOver = "";
  openAccount = false;
  openFindPurposes = false;
  purposeCodeForCheck: any = null
  templateName = '';
  minDate = signal<any>('');
  templateError = false;
  purposeDetails: BudgetReferenceContentDto | null = null
  templateList = signal<any[]>([])
  bronAndReserves = signal<any[]>([])
  choosedAcount = signal<Account | any>({});
  inputSubject = new Subject<any>();
  docNumSubject = new Subject<any>();
  purposeCode = '';
  templateId = '';
  purposePage = 0;

    signFormBudget: FormGroup = new FormGroup({
    templateId: new FormControl(null),
    transactionMode: new FormControl('BUDGET'),
    windowType: new FormControl('BUDGET_INCOME'),
    isAnor: new FormControl(false),
    balance: new FormGroup({
      amount: new FormControl(null, [Validators.required, Validators.min(0.01)]),
      scale: new FormControl(2),
      currency: new FormControl('UZS'),
    }),
    isSaved: new FormControl(false),
    isAutoPay: new FormControl(false),
    name: new FormControl(''),
    saldo: new FormGroup({
      amount: new FormControl(''),
      scale: new FormControl(2),
      currency: new FormControl('UZS'),
    }),
    docNum: new FormControl(''),
    docDate: new FormControl(null, Validators.required),
    sender: new FormGroup({
      account: new FormControl(''),
      pinfl: new FormControl(''),
    }),
    neotlojka: new FormControl(false),
    bron: new FormControl(false),
    recipient: new FormGroup({
      account: new FormControl('', [Validators.minLength(25), Validators.maxLength(25), Validators.required]),
      codeFilial: new FormControl(''),
      tax: new FormControl(''),
      name: new FormControl(''),
      pinfl: new FormControl(''),
      bankName: new FormControl(''),
    }),
    purpose: new FormGroup({
      name: new FormControl(null, Validators.required),
      code: new FormControl(null),
    }),
    description: new FormControl('', Validators.required),
  });


    ngOnInit(): void {

    const isKartoteka = this.activatedRoute.snapshot.queryParamMap.get('isKartoteka');
    const kartotekaType = this.activatedRoute.snapshot.queryParamMap.get('kartotekaType');
    // this.initLoan();
    this.analyticsService.logFirebaseCustomEvent('create_transfer_screen_jump', null);

    this.getDocDate();
    this.getTemplates()
    this.getDocNumber();
    this.getPurposeList();
    this.getAccounts1()

    if (isKartoteka === 'kartoteka') {
      this.getKartotekaData();
    }

    if (kartotekaType) {
      this.signFormBudget.patchValue({
        bron: kartotekaType === 'bron',
        neotlojka: kartotekaType === 'neotlojka',
      })
    }

    this.businessInfo = JSON.parse(localStorage.getItem("businessInfo") as string);
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
    this.activatedRoute.queryParams.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(query => {
        if (this.activatedRoute.snapshot.queryParamMap.get('type') === 'edit' || this.activatedRoute.snapshot.queryParamMap.get('type') === 'createFromTemplate') {
          this.getTemplateDetails(query["templateId"])
          this.templateName = query["templateName"]
          this.templateId = query["templateId"]
        }
        if (this.activatedRoute.snapshot.queryParamMap.get('type') === 'repeat' || this.activatedRoute.snapshot.queryParamMap.get('mode') === 'transaction') {
          this.getTransactionOneForRepeat()
        }
      })
  }


  checkCode() {
    const findPurpose = this.purposes.find(purpose => purpose.code === this.purposeCodeForCheck);
    if (!findPurpose) {
      this.signFormBudget.get('purpose.name')?.markAsTouched()
    }
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  editTransaction() {
    const isKartoteka = this.activatedRoute.snapshot.queryParamMap.get('isKartoteka');

    // this.checkPaymentAllowed();
    this.signFormBudget.markAllAsTouched();
    if (this.signFormBudget.invalid) {
      this.signFormBudget.markAllAsTouched();
      return;
    }
    if (this.balanceErrorOver.length > 0) {
      return;
    }
    this.checkTouchedSender();
    // if (this.signForm.valid) {
    //   this.checkPaymentAllowed();
    // }
    const rawDocDate = this.signFormBudget.value.docDate;
    const date = new Date(rawDocDate);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const formatted = `${day}.${month}.${year}`;

    const amount = this.signFormBudget.getRawValue().balance.amount;
    const amountInCents = Math.round(amount * 100);
    this.signFormBudget.patchValue({
      saldo: {
        amount: amountInCents
      },
      // docDate: formatted,
      isSaved: true,
      name: this.templateName,
      sender: {
        account: this.signFormBudget.getRawValue().sender.account.altAcctId,
        codeFilial: this.businessInfo.mainFilial,
        tax: this.businessInfo.inn,
        name: this.businessInfo.name
      }
    })
    const formValue = {...this.signFormBudget.getRawValue(), paymentSource: isKartoteka === 'kartoteka' ? (this.signFormBudget.getRawValue().neotlojka ? 'NEOTLOJKA' : this.signFormBudget.getRawValue().bron ? 'BRON' :'ACCOUNT'): 'ACCOUNT'};
    delete formValue.detail;
    delete formValue.balance
    delete formValue.isAnor;
    delete formValue.isAutoPay;
    delete formValue.isSaved;
    delete formValue.type;
    delete formValue.bron;
    delete formValue.neotlojka;
    delete formValue.windowType;
    delete formValue.transactionMode;
    this.utilsService.spinnerState$$.next(true);
    this.paymentService.editTemplateReq(formValue, (this.activatedRoute.snapshot.queryParamMap.get('transactionId') as string), 'transaction')
  }

  checkDocNum(value) {
    this.paymentService.checkDocNumber(value?.target.value)
  }


  setTemplateToForm(template) {
    this.templateName = template.name;
    const findAccount = this.accounts.find(account => account.altAcctId === template.sender.account)
    if (this.bronAndReserves().length > 0 ) {
      this.choosedAcount.set(findAccount)
    } else if (findAccount?.status === 'BLOCKED') {
      this.choosedAcount.set({})
    } else if (findAccount) {
      this.choosedAcount.set(findAccount)
    }
    this.signFormBudget.patchValue({
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
        account: this.bronAndReserves().length > 0 ? this.choosedAcount() : findAccount?.status === 'BLOCKED' ? {} : findAccount?.account ? findAccount : this.choosedAcount(),
        pinfl: template.sender.pinfl,
      },
      windowType: 'BUDGET_INCOME',
      transactionMode: 'BUDGET',
      recipient: {
        account: template.additionalInfo.recipientAccount,
        codeFilial: template.recipient.codeFilial,
        tax: template.recipient.tax,
        name: template.recipient.name,
        pinfl: template.recipient.pinfl,
        bankName: template.recipient.bankName,
      },
      purpose: {
        name: template.purpose.name,
        code: template.purpose.code,
      },
    })
    this._cdRef.detectChanges();
  }

  onAmountKeydown(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;

    // Считаем только цифры, без пробелов маски
    const digitsOnly = input.value.replace(/\D/g, '');

    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];

    if (digitsOnly.length >= 16 && !allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  editTemplate() {
    if (!this.templateName) {
      this.templateError = true;
      return;
    }
    const date = new Date(this.signFormBudget.value.docDate);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    const formatted = `${day}.${month}.${year}`;
    this.signFormBudget.patchValue({
      saldo: {
        amount: Number(this.signFormBudget.getRawValue().balance.amount) * 100,
      },
      // docDate: formatted,
      isSaved: true,
      name: this.templateName,
      sender: {
        account: this.choosedAcount().altAcctId,
        codeFilial: this.businessInfo.mainFilial,
        tax: this.businessInfo.inn,
        name: this.businessInfo.name
      }
    })
    const formValue = {...this.signFormBudget.getRawValue()};
    delete formValue.detail;
    delete formValue.balance
    delete formValue.isAnor;
    delete formValue.isAutoPay;
    delete formValue.isSaved;
    delete formValue.type;
    delete formValue.windowType;
    delete formValue.transactionMode;
    this.paymentService.editTemplateReq(formValue, this.templateId);
  }

  setValuesToForm(path: string, event: any, type: 'input' | 'text') {
    const value = type === 'input' ? event.target.value : event;
    const keys = path.split('.');
    let current = this.signFormBudget;

    for (let i = 0; i < keys.length - 1; i++) {
      current = current.get(keys[i]) as FormGroup;
      if (!current) return;
    }

    current.patchValue({[keys[keys.length - 1]]: value});
  }

  getDocNumber() {
    this.paymentService.getPaymentDocNum().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => {
      this.signFormBudget.patchValue({
        docNum: res.msg
      })
    })
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


  checkTouchedSender() {
    const invalid = this.signFormBudget.get('sender.account')?.invalid;
    const touched = this.signFormBudget.get('sender.account')?.touched;
    const res = Boolean(invalid && touched);
    this.senderAccountTouched.emit(res);
  }

  createTemplate() {
    this.signFormBudget.markAllAsTouched();
    if (this.signFormBudget.invalid) {
      this.signFormBudget.markAllAsTouched();
      return;
    }
    if (!this.templateName) {
      this.templateError = true;
      return;
    }
    const amount = this.signFormBudget.getRawValue().balance.amount;
    const amountInCents = Math.round(amount * 100);
    this.checkTouchedSender();

    const rawDocDate = this.signFormBudget.value.docDate;
    const date = new Date(rawDocDate);

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);


    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const formatted = `${day}.${month}.${year}`;
    this.accountService.getOperDayNew().pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.signFormBudget.patchValue({
          // docDate: formatted,
          saldo: {
            amount: amountInCents
          },
          isSaved: true,
          name: this.templateName,
          sender: {
            account: this.choosedAcount().altAcctId,
          }
        })
        const formValue = {...this.signFormBudget.getRawValue()};
        delete formValue.detail;
        delete formValue.balance;
        delete formValue.isAnor;
        this.utilsService.spinnerState$$.next(true);
        this.paymentService.createTemplate(formValue, '', this)
      })
  }

  getDocDate() {
    this.accountService.getOperDayNew().pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        const [day, month, year] = res.operDay.split('.').map(Number);

        const formattedDate = new Date(year, month - 1, day);
        this.signFormBudget.patchValue({
          docDate: formattedDate,
        })
        this.docDate = formattedDate;
        this.minDate.set(formattedDate);
      })
    // this._cdRef.detectChanges();
  }


  // private _utilsService = inject(UtilsService)
  private dialogRef: MatDialogRef<CodePurposeModalComponent> | null = null;
  searchPurposeText = signal<string>('');
  purposesAfterFilter = signal<any[]>([])
  purposes: CodePurposeContent[] | [] = [];

  getAccounts1() {
    this.accountService.getPaymentAllowed({
      size: 100,
      page: 0
    }, {
      transactionMode: "TRANSACTION",
      senderAccount: null
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(accounts => {
      if (accounts) {
        if (accounts.content?.length > 0) {
          const firstActive = accounts.content.find(item => item.status !== 'BLOCKED');
          if (firstActive) {
            this.choosedAcount.set(firstActive);
            this.signFormBudget.patchValue({
              sender: {
                account: firstActive?.altAcctId
              }
            })
          }
        }
        this._cdRef.detectChanges();
        this.accounts = accounts.content
      }
    })
  }




  checkKartatotka(type) {
    if (type === 'BRON') {
      this.signFormBudget.patchValue({
        neotlojka: false,
        bron: true,
      })
    } else {
      this.signFormBudget.patchValue({
        neotlojka: true,
        bron: false,
      })
    }
  }


  openKartoteka2Info(type: string) {
    this.matDialog.open(InfoModalComponent, {
      data: {type: type},
      width: "481px",
      minHeight: "426px"
    })
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
    const mode = this.activatedRoute.snapshot.queryParamMap.get('mode');
    const kartotekaType = this.activatedRoute.snapshot.queryParamMap.get('kartotekaType');
    this.transactionService.checkKartoteka('BUDGET').pipe().subscribe((res: any) => {
      this.bronAndReserves.set(res?.data);
      if (kartotekaType && kartotekaType === 'bron') {
        const filteredRes = res?.data.find((item: any) => item.amountType === 'BRON');
        if (mode !== 'transaction' && mode !== 'repeat') {
          this.signFormBudget.patchValue({
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
          this.signFormBudget.patchValue({
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

  getTransactionOneForRepeat() {
    this.paymentService.getTransactionOne(this.activatedRoute.snapshot.queryParamMap.get('transactionId') as string).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (templateDetails: any) => {
          setTimeout(() => {
            const account = this.accounts?.find(acc => acc.altAcctId === templateDetails.sender.account);
            if (account && account.status !== 'BLOCKED') {
              this.choosedAcount.set(account)
            }
            this.signFormBudget.patchValue({
              saldo: templateDetails.isDebit ?
                {amount: templateDetails.senderAmount.amount / 100} :
                {amount: templateDetails.receiverAmount.amount / 100},
              balance: templateDetails.isDebit ?
                {amount: templateDetails.senderAmount.amount / 100} :
                {amount: templateDetails.receiverAmount.amount / 100},
              description: templateDetails.description,
              sender: {
                account: account?.status === 'BLOCKED' ? {} : account?.account ? account : this.choosedAcount(),
                pinfl: templateDetails.sender.pinfl,
              },
              bron: templateDetails.paymentSource === 'BRON',
              neotlojka: templateDetails.paymentSource === 'NEOTLOJKA',
              recipient: {
                account: templateDetails.additionalInfo.recipientAccount,
                codeFilial: templateDetails.recipient.codeFilial,
                tax: templateDetails.recipient.tax,
                name: templateDetails.recipient.name,
                pinfl: templateDetails.recipient.pinfl,
                bankName: templateDetails.recipient.bankName,
              },
              name: templateDetails.name,
              purpose: {
                name: templateDetails.purpose.name,
                code: templateDetails.purpose.code,
              },
            })
          }, 1000)
        },
      })
  }

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
      title: "В бюджет",
      link: '/'
    },
  ];

  setTemplateName(event: any) {
    this.templateError = event.target.value?.length <= 0;
    this.templateName = event.target.value;
  }

  getTemplateDetails(templateId: string) {
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

            this.signFormBudget.patchValue({
              saldo: templateDetails.isDebit ?
                {amount: templateDetails.senderAmount.amount / 100} :
                {amount: templateDetails.receiverAmount.amount / 100},
              balance: templateDetails.isDebit ?
                {amount: templateDetails.senderAmount.amount / 100} :
                {amount: templateDetails.receiverAmount.amount / 100},
              description: templateDetails.description,
              sender: {
                account: !account ? this.accounts[0] : this.choosedAcount(),
                pinfl: templateDetails.sender.pinfl,
              },
              recipient: {
                account: templateDetails.additionalInfo.recipientAccount,
                codeFilial: templateDetails.recipient.codeFilial,
                tax: templateDetails.recipient.tax,
                name: templateDetails.recipient.name,
                pinfl: templateDetails.recipient.pinfl,
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
        complete: () => {
          this._cdRef.markForCheck();
        }
      })
  }

  resetRecipientForm() {
    this.signFormBudget.patchValue({
      recipient: {
        name: null,
        tax: null,
      }
    });
  }

  getTemplates() {
    this.accountsPaymentService.getTransactionListV2({size: 10, page: 0},
      {
        toAmount: null,
        fullHistory: true,
        statuses: [
          "SAVED"
        ],
        inn: null,
        fromAmount: 0,
        docNum: null,
        transactionModes: null,
        currency: null,
        windowType: ["BUDGET_INCOME"],
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
      }).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res?.content) {
            this.templateList.set(res.content)
          }
        }
      })
  }

  processFoundReference(data: BudgetReferenceContentDto) {
    this.signFormBudget.patchValue({
      recipient: {
        name: data?.recipientName,
        soatoCode: data?.soatoDistrictCode,
        regionName: data?.soatoDetail?.regionName,
        regionCode: data?.soatoDetail?.regionCode,
        districtName: data?.soatoDetail?.districtName,
      }
    })
    this._cdRef.detectChanges();
  }


  getAccountReferences(account: string) {
    this.paymentService.getAccountReferenceV2({
      account: account,
      inn: null,
      page: 0,
      size: 100,
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
      if (!res || !res.content) return;
      const foundReference = res.content.find(item => item.recipientAccountNumber === account);
      this.purposeDetails = foundReference ?? null;
      if (foundReference) {
        this.processFoundReference(foundReference);
      } else {
      }
      this._cdRef.markForCheck();
    });
  }

  getReferences(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const accountValue = inputElement.value;
    if (accountValue.length < 25) {
      this.resetRecipientForm();
      return;
    }
    if (accountValue.length === 25) {
      this.getAccountReferences(accountValue);
    }
  }

  private parseNumber(value: any): number {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;

    const normalized = value.toString().replace(/\s/g, '').replace(',', '.');
    return parseFloat(normalized) || 0;
  }

  convertAmountIntoWords() {
    const isKartoteka = this.activatedRoute.snapshot.queryParamMap.get('isKartoteka');

    const bronData = this.bronAndReserves()?.find(item => item.amountType === 'BRON');
    const neotlojkaData = this.bronAndReserves()?.find(item => item.amountType === 'NEOTLOJKA');

    const maxAmount = isKartoteka === 'kartoteka' ? (this.signFormBudget.getRawValue().bron ? bronData.amount.amount / 100 : this.signFormBudget.getRawValue().neotlojka ? neotlojkaData.amount.amount / 100 : 0) : this.choosedAcount().balance?.amount
      ? this.choosedAcount().balance.amount / 100
      : 0;
    const formValue = this.signFormBudget.getRawValue();
    const entered = this.parseNumber(formValue?.balance?.amount ?? 0);
    const max = this.parseNumber(maxAmount);

    let validAmount = entered;
    if (entered > max) {
      this.balanceErrorOver = isKartoteka === 'kartoteka' ? (this.signFormBudget.getRawValue().bron ? this.translate.instant('createPayment.warning_bron') : this.translate.instant('createPayment.warning_neotlojki')) : "На счёте недостаточно средств";
    } else {
      this.balanceErrorOver = "";
    }

    if (validAmount) {
      this.amountInWords = this.amountsService.numberToWordsRU(validAmount);
    } else {
      this.amountInWords = '';
    }
  }

  purposeSelect(purpose: any) {
    this.signFormBudget.patchValue({
      purpose: {
        name: purpose.value,
        code: purpose.key,
        purposeCode: purpose.key,
      }
    })
  }


  searchPurpose(searchText: any) {
    if (searchText.target.value?.length === 5) {
      this.searchPurposeText.set(searchText.target.value);
      const findArray = this.purposes.filter(purpose => purpose.code === searchText.target.value)
      if (findArray?.length === 0) {
        this.signFormBudget.get('recipient.codeFilial')?.setErrors(null)
      } else {
        this.purposesAfterFilter.set(this.purposes.filter(purpose => purpose.code === searchText.target.value))
      }
    } else {
      this.searchPurposeText.set(searchText.target.value);
      this.purposesAfterFilter.set(this.purposes)
    }
  }

  openChooseList() {
    if (!this.dialogRef) {
      this.dialogRef = this.matDialog.open(CodePurposeModalComponent, {
        data: {
          purpose: this.signFormBudget.value.purpose,
          searchText: this.searchPurposeText,
          purposesAfterFilter: this.purposesAfterFilter,
          setSearchText: (value: any) => this.searchPurpose(value),
          purposeSelect: (value: any) => this.purposeSelect(value),
        },
        width: '600px',
        height: 'calc(100% - 8px)',
        position: {right: '0'},
        panelClass: 'right-side-dialog',
      });

      this.dialogRef.afterClosed().subscribe(() => {
        this.dialogRef = null;
      });
    }

    if (this.dialogRef?.componentInstance) {
      this.dialogRef.componentInstance.purposes = this.purposes;
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'F9') {
      event.preventDefault();
      this.openChooseList();
    }
  }

  getPurposeList() {
    this.paymentService.getPurposes({
      page: 0,
      size: 1000,
      searchText: this.purposeCode
    }, PurposeTypes.BUDGET_INCOME).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        const content = res?.content as any;
        if (content && Array.isArray(content)) {
          if (this.purposePage === 0) {
            this.purposes = content;
          } else {
            this.purposes = [...this.purposes, ...content];
          }
        }
      },
      complete: () => {
        this._cdRef.markForCheck();
      }
    })
  }

  getAccounts() {
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
    this.matDialog.open(AccountsListPaymentsComponent, {
      data: {},
      width: '600px',
      height: 'calc(100% - 32px)',
      position: {
        right: '16px',
      },
      panelClass: 'right-side-dialog',
    })

  }

  chooseAccFunc(account) {
    this.choosedAcount.set(account);
    this.convertAmountIntoWords();
  }

  submit() {
    const isKartoteka = this.activatedRoute.snapshot.queryParamMap.get('isKartoteka');

    const isNeedAutoPay = this.docDate < this.signFormBudget.value.docDate;
    // this.checkPaymentAllowed();
    this.signFormBudget.markAllAsTouched();
    if (this.signFormBudget.invalid) {
      this.signFormBudget.markAllAsTouched();
      return;
    }

    if (this.balanceErrorOver.length > 0) {
      return;
    }

    const amount = this.signFormBudget.getRawValue().balance.amount;
    const amountInCents = Math.round(amount * 100);
    const rawDocDate = this.signFormBudget.value.docDate;
    const date = new Date(rawDocDate);

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const formatted = `${day}.${month}.${year}`;
    this.signFormBudget.patchValue({
      // docDate: formatted,
      saldo: {
        amount: amountInCents
      },
      isAutoPay: isNeedAutoPay,
      sender: {
        account: this.choosedAcount().altAcctId,
      }
    })
    const formValue = {
      ...structuredClone(this.signFormBudget.getRawValue()),
      docDate: formatted,
      paymentSource: isKartoteka === 'kartoteka' ? (this.signFormBudget.getRawValue().neotlojka ? 'NEOTLOJKA' : this.signFormBudget.getRawValue().bron ? 'BRON' : 'ACCOUNT') : 'ACCOUNT'
    };
    delete formValue.detail;
    delete formValue.balance;
    delete formValue.isAnor;
    delete formValue.bron;
    delete formValue.neotlojka;
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
    this.utilsService.spinnerState$$.next(true);
    this.paymentService.createTransaction(formValue, 'SAVE', '', this)
  }

  protected readonly Number = Number;
}
