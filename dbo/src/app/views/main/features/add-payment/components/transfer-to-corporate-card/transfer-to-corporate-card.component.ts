import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  HostListener, inject,
  OnInit,
  signal
} from "@angular/core";
import {CommonModule} from "@angular/common";
import {ActivatedRoute, Router, RouterModule} from "@angular/router";
import {AmountService} from "../../../../../../core/services/amount.service";
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {AccountsDto, BudgetReferenceContentDto} from "../../../accounts-payments/models/accounts-payments.model";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {AccountsListPaymentsComponent} from "../../modals/account-list-modal/account-list-modal.component";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {NgxMaskDirective, NgxMaskPipe} from "ngx-mask";
import {UserInfoDto} from "../../../../../../core/models/user.model";
import {ToastrService} from "ngx-toastr";
import {PaymentService} from "../../../../../../core/services/payment.service";
import {AccountService} from "../../../../../../core/services/account.service";
import {AccountsPaymentsService} from "../../../accounts-payments/services/accounts-payments.service";
import {CodePurposeModalComponent} from "../../modals/code-purpose/code-purpose-modal.component";
import {debounceTime, distinctUntilChanged, Subject} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {filter} from "rxjs/operators";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatNativeDateModule} from "@angular/material/core";
import {animate, style, transition, trigger} from "@angular/animations";
import {UtilsService} from "../../../../../../core/services/utils.service";
import {Account} from "../transfer-to-account/transfer-to-account.component";
import {SalaryProjectService} from "../../../../../../core/services/salary-project.service";
import {
  PaymentSuccessModalComponent
} from "../../../../../../shared/components/payment-success-modal/payment-success-modal";
import {
  TemplateSuccessModalComponent
} from "../../../../../../shared/components/template-success-modal/template-success-modal";
import {CardStore} from "../../../../../../store/card.store";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {
  ServiceControllerCheckComponent
} from "../../../../../../core/components/service-controller-check/service-controller-check.component";
import {
  ServiceControllerStore
} from "../../../../../../core/components/service-controller-check/service-controller.store";
import {FirebaseAnalyticsService} from "../../../../../../../../firebase-analytics.service";
import {TransactionService} from "../../../../../../core/services/transaction.service";
import {MatTooltip} from "@angular/material/tooltip";
import {InfoModalComponent} from "../../../kartoteka/kartoteka-2/components/info-modal/info-modal.component";
import { NumericOnlyDirective } from "src/app/shared/directives/numeric-only.directive";
import {CancelModalComponent} from "../../../template-transactions/components/cancel-modal/cancel-modal.component";

@Component({
  selector: 'app-transfer-to-card',
  imports: [ NumericOnlyDirective, CommonModule, MatDatepickerModule, MatFormFieldModule, MatInputModule, MatNativeDateModule, RouterModule, ReactiveFormsModule, NgxMaskDirective, NgxMaskPipe, FormsModule, TranslateModule, MatTooltip],
  templateUrl: './transfer-to-corporate-card.component.html',
  styles: [
    `
      ::ng-deep .mat-calendar-body-selected {
        background-color: #00A38D !important;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
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
export class TransferToCorporateCardComponent implements OnInit {
  isOpen = false;
  openAccount = false;
  openCorpAccount = false;
  openFindPurposes = false;
  openFindMfo = false;
  purposeCodeForCheck: any = null
  touched = false;
  oldTransactionUuid: string = '';
  templateCreateModal = false;
  selectedAccount!: AccountsDto | null | undefined;
  accounts!: any[];
  mfoList: any[] = [];
  bankName: string = "";
  fromQuery = '';
  corporateCardList: any[] = [];
  purposePage = 0;
  switchAcc = false;
  descriptionPurpose: any = {};
  businessInfo: UserInfoDto | Record<string, any> = {};
  templateList = signal<any[]>([])

  constructor(
    public amountService: AmountService,
    private fb: FormBuilder,
    private matDialog: MatDialog,
    private _cdRef: ChangeDetectorRef,
    private toastrService: ToastrService,
    private paymentService: PaymentService,
    private accountService: AccountService,
    private destroyRef: DestroyRef,
    private utilsService: UtilsService,
    protected activatedRoute: ActivatedRoute,
    private transactionService: TransactionService,
    private amountsService: AmountService,
    private translate: TranslateService,
    public router: Router,
    private accountsPaymentService: AccountsPaymentsService,
    private serviceStore: ServiceControllerStore,
    private analyticsService: FirebaseAnalyticsService,
  ) {
  }

  transferForm = this.fb.nonNullable.group({
    template: ''
  });
  private _salaryService = inject(SalaryProjectService);
  readonly cardStore = inject(CardStore)
  #destroy = inject(DestroyRef)

  amountInWords = '';
  purposes: any[] = [];
  minDate = signal<any>('');
  codeInput: boolean = false;
  templateName = '';
  purposeCode = '';
  templateError = false;
  mfoCode = '';
  templateId = '';
  searchPurposeText = signal<string>('');
  purposesAfterFilter = signal<any[]>([])
  bronAndReserves = signal<any[]>([])
  cardInfo = signal<any>({})
  choosedAcount = signal<Account | Record<string, any>>({});
  choosedCorpCardAcount = signal<any | Record<string, any>>({});
  balanceErrorOver = "";
  private dialogRef: MatDialogRef<CodePurposeModalComponent> | null = null;
  inputSubject = new Subject<any>();
  docNumSubject = new Subject<any>();

  signFormBudget: FormGroup = new FormGroup(
    {
      // employeesItems : [
      //   {
      //     "fio" : "ISHONCH PLAST MONTAJ MCHJ",
      //     "amountTransferToCard" : 12300,
      //     "accountNumberCard" : "22620000904899265002"
      //   }
      // ],
      name: new FormControl(''),
      isSaved: new FormControl(false),
      amount: new FormControl(null, [Validators.required, Validators.min(0.01)]),
      docNum: new FormControl(''),
      docDate: new FormControl(null),
      mode: new FormControl(""),
      bron: new FormControl(false),
      neotlojka: new FormControl(false),
      senderAccount: new FormControl(''),
      transitAccount: new FormControl(''),
      cardUserType: new FormControl("CORPORATE"),
      reestrNumber: new FormControl(''),
      contractNumber: new FormControl(''),
      payPurpose: new FormControl(''),
      description: new FormControl('', Validators.required)
    }
  );

  click(acc) {
    console.log(acc, "fff");
  }

  checkCode() {
    const findPurpose = this.purposes.find(purpose => purpose.code === this.purposeCodeForCheck);
    if (!findPurpose) {
      this.signFormBudget.get('purpose.name')?.markAsTouched()
    }
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

  getCardInfo(event: any) {
    const value = event.target.value;
    if (value.length === 19) {
      const valueAfterReplace = value.replaceAll(" ", "");

      if (this.signFormBudget.value.purposeType?.length > 0) {
        this.accountService.getCardPurposes({
          pan: valueAfterReplace,
          purposeType: this.signFormBudget.value.purposeType
        }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => {
          this.signFormBudget.patchValue({
            purposeName: res.purpose
          })
          this._cdRef.detectChanges()
        })
      }

      this.accountService.getCardInfo({pan: valueAfterReplace}).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => {
        this.cardInfo.set(res)
        this.signFormBudget.patchValue({
          recipientMfo: res.mfo,
          recipientAccount: res.recipientAccount,
        })
      })
      this._cdRef.detectChanges()
    } else {
      this.cardInfo.set({})
    }
  }

  switcherClick() {
    this.switchAcc = !this.switchAcc;
    // this.convertAmountIntoWords()
  }

  getCardPurposes(event: any) {
    this.openFindPurposes = false;
    this.setValuesToForm('purposeType', event, 'text')
    if (this.signFormBudget.value.pan.length > 0) {
      this.accountService.getCardPurposes({
        pan: this.signFormBudget.value.pan,
        purposeType: event
      }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => {
        this.signFormBudget.patchValue({
          purposeName: res.purpose
        })
      })
    }
    this._cdRef.detectChanges()
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

  onAmountKeydown(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;

    // Считаем только цифры, без пробелов маски
    const digitsOnly = input.value.replace(/\D/g, '');

    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];

    if (digitsOnly.length >= 16 && !allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  getKartotekaData() {
    const mode = this.activatedRoute.snapshot.queryParamMap.get('mode');
    const kartotekaType = this.activatedRoute.snapshot.queryParamMap.get('kartotekaType');
    this.transactionService.checkKartoteka('CORP_CARD_TOP_UP').pipe().subscribe((res: any) => {
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
        }, 1500)
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
        }, 1500)
      }
    })
  }

  getCorporateCard() {
    this._salaryService.getAllPayrollProjectList(
      {
        page: 0,
        size: 100,
        userType: 'CORPORATE',
      })
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe(res => {
        if (!res) return;
        if (this.activatedRoute.snapshot.queryParamMap.get('type') === 'fromCorpCard') {
          const cardFromQuery = res.content.find(item => item.uuid === this.activatedRoute.snapshot.queryParamMap.get("cardId"))
          this.choosedCorpCardAcount.set(cardFromQuery);
        } else {
          const firstActive = res.content.find(item => item.status !== 'BLOCKED');
          this.choosedCorpCardAcount.set(firstActive);
        }
        this.corporateCardList = res.content;
        this._cdRef.detectChanges();
      });
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
    const amount = this.signFormBudget.getRawValue().amount;
    const amountInCents = Math.round(amount * 100);
    this.utilsService.spinnerState$$.next(true);
    const isoDate = this.signFormBudget.value.docDate
    const d = new Date(isoDate)
    const formatted = d.toLocaleDateString('ru-RU')
    this.signFormBudget.patchValue({
      docDate: formatted,
      senderAccount: this.choosedAcount().altAcctId,
      transitAccount: this.choosedCorpCardAcount().transitAccount,
      contractNumber: this.choosedCorpCardAcount().contractNumber,
      mode: this.switchAcc ? 'DR' : 'CR',
      isSaved: true,
      name: this.templateName,
    })
    const formValue = {
      employeesItems : [
        {
          fio : this.choosedCorpCardAcount().ownerName,
          amountTransferToCard : amountInCents,
          accountNumberCard : this.choosedCorpCardAcount().account,
          maskedPan: this.choosedCorpCardAcount().pan
        }
      ],
      salaryPrepareReq: this.signFormBudget.getRawValue()
    };
    delete formValue.salaryPrepareReq.amount
    delete formValue.salaryPrepareReq.purpose
    this.accountsPaymentService.prepareCorpCardTransaction(formValue).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: () => {
          this.utilsService.spinnerState$$.next(false);
          this.toastrService.success('Шаблон создан!')
          this.router.navigate(['/templates'])
        },
        error: (err) => {
          this.getDocDate();
          this.utilsService.spinnerState$$.next(false);
          this.toastrService.error(err.errorMessage || err || 'Что-то пошло не так!');
        }
      })
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
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
        transactionModes: ["CORP_CARD_TOP_UP"],
        currency: null,
        windowType: ["CORPORATE"],
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

  purposeSelect(purpose: any) {
    this.signFormBudget.patchValue({
      purpose: {
        name: purpose.value,
        code: purpose.key,
        purposeCode: purpose.key,
      }
    })
  }

  chooseAccFunc(account) {
    this.choosedAcount.set(account);
    this.convertAmountIntoWords();
  }

  getPurposeList() {
    this.accountService.getPurposesCorpCard().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        const content = res?.content;
        if (content && Array.isArray(content)) {
          this.signFormBudget.patchValue({
            payPurpose: `${res.content[0].key} - ${res.content[0].value}`
          })
        }
      },
      complete: () => {
        this._cdRef.markForCheck();
      }
    })
  }

  getMfoList() {
    this.accountsPaymentService.getMfoList({
      page: 0,
      size: 50,
      bankBranchCode: null,
      search: this.mfoCode ?? null
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        this.mfoList = res.content;
        this._cdRef.detectChanges();
      }
    })
    this._cdRef.detectChanges();
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

  resetRecipientForm() {
    this.signFormBudget.patchValue({
      recipient: {
        name: null,
        tax: null
      }
    });
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

  processFoundReference(data: BudgetReferenceContentDto) {
    this.signFormBudget.patchValue({
      recipient: {
        codeFilial: data.branchCode,
        tax: data.inn,
        name: data.recipientName,
        bankName: null,
        pinfl: null,
      }
    })
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
    if (accountValue.length < 27) {
      this.resetRecipientForm();
      return;
    }
    if (accountValue.length === 27) {
      this.getAccountReferences(accountValue);
    }
  }

  getDocNumber() {
    this.paymentService.getPaymentDocNum().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => {
      this.signFormBudget.patchValue({
        docNum: res.msg
      })
    })
  }

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

  editTemplate() {
    this.signFormBudget.markAllAsTouched();
    if (this.signFormBudget.invalid) {
      this.signFormBudget.markAllAsTouched();
      return;
    }
    if (!this.templateName) {
      this.templateError = true;
      return;

    }
    const amount = this.signFormBudget.getRawValue().amount;
    const amountInCents = Math.round(amount * 100);
    this.utilsService.spinnerState$$.next(true);
    const isoDate = this.signFormBudget.value.docDate
    const d = new Date(isoDate)
    const formatted = d.toLocaleDateString('ru-RU')
    this.signFormBudget.patchValue({
      docDate: formatted,
      senderAccount: this.choosedAcount().altAcctId,
      transitAccount: this.choosedCorpCardAcount().transitAccount,
      contractNumber: this.choosedCorpCardAcount().contractNumber,
      mode: this.switchAcc ? 'DR' : 'CR',
      isSaved: true,
      name: this.templateName,
    })
    const formValue = {
      employeesItems : [
        {
          fio : this.choosedCorpCardAcount().ownerName,
          amountTransferToCard : amountInCents,
          accountNumberCard : this.choosedCorpCardAcount().account,
          maskedPan: this.choosedCorpCardAcount().pan
        }
      ],
      salaryPrepareReq: {...this.signFormBudget.getRawValue(), oldTransactionUuid: this.oldTransactionUuid}
    };
    delete formValue.salaryPrepareReq.amount
    delete formValue.salaryPrepareReq.purpose
    this.accountsPaymentService.prepareCorpCardTransaction(formValue).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: () => {
          this.utilsService.spinnerState$$.next(false);
          this.matDialog.open(TemplateSuccessModalComponent, {
            data: {mode: 'edit'}
          });
        },
        error: (err) => {
          this.getDocDate();
          this.utilsService.spinnerState$$.next(false);
          this.toastrService.error(err.errorMessage || err || 'Что-то пошло не так!');
        }
      })
  }

  setTemplateName(event: any) {
    this.templateError = event.target.value?.length <= 0;
    this.templateName = event.target.value;
  }

  setTemplateToForm(templateDetails: any) {
    this.oldTransactionUuid = templateDetails.id;
    this.accountsPaymentService.getTransactionListV2({size: 10, page: 0},
      {
        toAmount: null,
        fullHistory: true,
        statuses: [],
        inn: null,
        fromAmount: 0,
        docNum: null,
        transactionModes: ['CORP_CARD_TOP_UP_CHILD'],
        currency: null,
        windowType: [],
        endDate: null,
        type: "ANY",
        foreignCurrency: null,
        senderAccount: null,
        parentId: templateDetails.transactionId,
        receiverName: null,
        transactionStepFilter: null,
        searchText: "",
        startDate: null,
        receiverAccount: null
      }).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res?.content) {
            const findAcc = this.corporateCardList.find(item => item.transitAccount === res.content[0]?.sender?.account)
            if (findAcc) {
              this.choosedCorpCardAcount.set(findAcc)
            }
          }
        }
      })
    // if (templateDetails.additionalInfo.corpCardMode === 'DR') {
    //   this.switchAcc = true
    // } else  if (templateDetails.additionalInfo.corpCardMode ===  'CR') {
    //   this.switchAcc = false
    // }
    this.templateName = templateDetails.name;
    const account = this.accounts.find(acc => acc.altAcctId === templateDetails.sender.account);
    if (this.bronAndReserves().length > 0 ) {
      this.choosedAcount.set(account)
    } else if (account?.status === 'BLOCKED') {
      this.choosedAcount.set({})
    } else if (account) {
      this.choosedAcount.set(account)
    }
    this.signFormBudget.patchValue({
      amount: templateDetails.senderAmount.amount / 100,
      mode: templateDetails.additionalInfo.corpCardMode,
      senderAccount: this.bronAndReserves()?.length > 0 ? this.choosedAcount() : account?.status === 'BLOCKED' ? {} : account?.account ? account : this.choosedAcount(),
      transitAccount: templateDetails.additionalInfo.transitAccount,
      contractNumber: templateDetails.additionalInfo.contractNumber,
      description: templateDetails.description,
    })
    this._cdRef.detectChanges();
  }

  getTemplateDetails(templateId: string) {
    this.accountsPaymentService.getSavedPaymentDetails(templateId).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (templateDetails: any) => {
          setTimeout(() => {
            this.oldTransactionUuid = templateDetails.id;
            this.accountsPaymentService.getTransactionListV2({size: 10, page: 0},
              {
                toAmount: null,
                fullHistory: true,
                statuses: [],
                inn: null,
                fromAmount: 0,
                docNum: null,
                transactionModes: ['CORP_CARD_TOP_UP_CHILD'],
                currency: null,
                windowType: [],
                endDate: null,
                type: "ANY",
                foreignCurrency: null,
                senderAccount: null,
                parentId: templateDetails.transactionId,
                receiverName: null,
                transactionStepFilter: null,
                searchText: "",
                startDate: null,
                receiverAccount: null
              }).pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe({
                next: (res) => {
                  if (res?.content) {
                    const findAcc = this.corporateCardList.find(item => item.account === res.content[0]?.sender?.account)
                    console.log(findAcc, "ff")
                    if (findAcc) {
                      this.choosedCorpCardAcount.set(findAcc)
                    }
                  }
                }
              })
            // if (templateDetails.additionalInfo.corpCardMode === 'DR') {
            //   this.switchAcc = true
            // } else  if (templateDetails.additionalInfo.corpCardMode ===  'CR') {
            //   this.switchAcc = false
            // }
            this.templateName = templateDetails.name;
            const account = this.accounts.find(acc => acc.altAcctId === templateDetails.sender.account);
            if (account) {
              this.choosedAcount.set(account);
            }
            this.signFormBudget.patchValue({
              amount: templateDetails.senderAmount.amount / 100,
              mode: templateDetails.additionalInfo.corpCardMode,
              senderAccount: account ?? this.choosedAcount(),
              transitAccount: templateDetails.additionalInfo.transitAccount,
              contractNumber: templateDetails.additionalInfo.contractNumber,
              description: templateDetails.description,
            })
            this._cdRef.detectChanges();
          }, 500)
        },
        complete: () => {
          this._cdRef.markForCheck();
        }
      })
  }

  getTransactionOneForRepeat() {
    this.paymentService.getTransactionOne(this.activatedRoute.snapshot.queryParamMap.get('transactionId') as string).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (templateDetails: any) => {
          setTimeout(() => {
            const recipientAcc = this.corporateCardList?.find(acc => acc.account === templateDetails.recipient.account)
            const account = this.accounts.find(acc => acc.account === templateDetails.sender.account);
            this.signFormBudget.patchValue({
              amount: templateDetails.senderAmount.amount / 100,
              mode: templateDetails.additionalInfo.corpCardMode,
              senderAccount: account ?? this.choosedAcount(),
              bron: templateDetails.additionalInfo.paymentSource === 'BRON',
              neotlojka: templateDetails.additionalInfo.paymentSource === 'NEOTLOJKA',
              transitAccount: templateDetails.additionalInfo.transitAccount,
              contractNumber: templateDetails.additionalInfo.contractNumber,
              description: templateDetails.description,
            })
          }, 500)
        },
      })
  }

  ngOnInit(): void {

    const isKartoteka = this.activatedRoute.snapshot.queryParamMap.get('isKartoteka');
    const kartotekaType = this.activatedRoute.snapshot.queryParamMap.get('kartotekaType');

    this.serviceStore.setServices(['IABS', 'UZCARD']);
    this.getMfoList();
    this.getDocDate();
    this.getDocNumber();
    this.getTemplates();
    this.getAccounts1();

    if (isKartoteka === 'kartoteka') {
      this.getKartotekaData();
    }

    if (kartotekaType) {
      this.signFormBudget.patchValue({
        bron: kartotekaType === 'bron',
        neotlojka: kartotekaType === 'neotlojka',
      })
    }
    this.getCorporateCard();
    this.getPurposeList();
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
        if (this.activatedRoute.snapshot.queryParamMap.get('mode') === 'CR') {
          this.switchAcc = false
        }
        if (this.activatedRoute.snapshot.queryParamMap.get('mode') === 'DR') {
          this.switchAcc = true
        }
        this._cdRef.detectChanges();
      })
    this.businessInfo = JSON.parse(localStorage.getItem("businessInfo") as string);
    this.signFormBudget.get('recipient.codeFilial')?.valueChanges
      .pipe(
        filter(value => value !== null && value !== ''),
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(value => {
        this.accountsPaymentService.getMfoDetails(value).pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (res: any) => {
              this.signFormBudget.patchValue({
                recipient: {
                  bankName: res.bankBranchName,
                }
              })
            },
            complete: () => {
              this._cdRef.markForCheck();
            }
          })
      });
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

  // convertAmountIntoWords(event?: any) {
  //   const value = event?.target.value.replace(/[^0-9]/g, '');
  //   if (event) {
  //     this.setValuesToForm('saldo.amount', event?.target.value, 'text')
  //   }
  //   if (value) {
  //     this.amountInWords = this.amountsService.numberToWordsRU(Number(value));
  //   } else {
  //     this.amountInWords = '';
  //   }
  // }

  private parseNumber(value: any): number {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;

    // убираем пробелы и заменяем запятую на точку
    const normalized = value.toString().replace(/\s/g, '').replace(',', '.');
    return parseFloat(normalized) || 0;
  }

  convertAmountIntoWords() {
    const type = this.activatedRoute.snapshot.queryParamMap.get('type');
    const isKartoteka = this.activatedRoute.snapshot.queryParamMap.get('isKartoteka');

    const bronData = this.bronAndReserves()?.find(item => item.amountType === 'BRON');
    const neotlojkaData = this.bronAndReserves()?.find(item => item.amountType === 'NEOTLOJKA');

    const maxAmount = isKartoteka === 'kartoteka' ? (this.signFormBudget.getRawValue().bron ? bronData.amount.amount / 100 : this.signFormBudget.getRawValue().neotlojka ? neotlojkaData.amount.amount / 100 : 0) : this.choosedAcount().balance?.amount
      ? this.choosedAcount().balance.amount / 100
      : 0;

    const formValue = this.signFormBudget.getRawValue();
    const entered = this.parseNumber(formValue?.amount ?? 0);
    const maxCorp = this.parseNumber((this.choosedCorpCardAcount())?.balance?.amount
      ? (this.choosedCorpCardAcount())?.balance?.amount / 100
      : 0);
    const max = this.parseNumber(maxAmount);
    const maxFinal = !this.switchAcc ? max : maxCorp
    let validAmount = entered;
    if (entered > maxFinal) {
      this.balanceErrorOver = isKartoteka === 'kartoteka' ? (this.signFormBudget.getRawValue().bron ? this.translate.instant('createPayment.warning_bron') :this.translate.instant('createPayment.warning_neotlojki')) : "На счёте недостаточно средств";
    } else {
      this.balanceErrorOver = "";
    }

    if (validAmount) {
      this.amountInWords = this.amountsService.numberToWordsRU(validAmount);
    } else {
      this.amountInWords = '';
    }
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

  getDocDate() {
    this.accountService.getOperDayNew().pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        const [day, month, year] = res.operDay.split('.').map(Number);

        const formattedDate = new Date(year, month - 1, day);
        this.signFormBudget.patchValue({
          docDate: formattedDate,
        })
        this.minDate.set(formattedDate);
      })
    // this._cdRef.detectChanges();
  }

  editTransaction() {
    const isKartoteka = this.activatedRoute.snapshot.queryParamMap.get('isKartoteka');
    this.signFormBudget.markAllAsTouched();
    if (this.signFormBudget.invalid) {
      this.signFormBudget.markAllAsTouched();
      return;
    }
    this.utilsService.spinnerState$$.next(true);

    const isoDate = this.signFormBudget.value.docDate
    const d = new Date(isoDate)
    const formatted = d.toLocaleDateString('ru-RU')
    this.signFormBudget.patchValue({
      docDate: formatted,
      senderAccount: this.choosedAcount().altAcctId,
      transitAccount: this.choosedCorpCardAcount().transitAccount,
      contractNumber: this.choosedCorpCardAcount().contractNumber,
      mode: this.switchAcc ? 'DR' : 'CR',
    })
    const formValue = {
      employeesItems : [
        {
          fio : this.choosedCorpCardAcount().ownerName,
          amountTransferToCard : Number(this.signFormBudget.getRawValue().amount * 100),
          accountNumberCard : this.choosedCorpCardAcount().account,
          maskedPan: this.choosedCorpCardAcount().pan
        }
      ],
      salaryPrepareReq: {...this.signFormBudget.getRawValue(), paymentSource: isKartoteka === 'kartoteka' ? (this.signFormBudget.getRawValue().neotlojka ? 'NEOTLOJKA' : this.signFormBudget.getRawValue().bron ? 'BRON' :'ACCOUNT'): 'ACCOUNT',}
    };
    delete formValue.salaryPrepareReq.amount
    delete formValue.salaryPrepareReq.purpose
    delete formValue.salaryPrepareReq.bron
    delete formValue.salaryPrepareReq.neotlojka
    this.accountsPaymentService.editCorpCardTransaction(formValue).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.utilsService.spinnerState$$.next(false);
          this.matDialog.open(PaymentSuccessModalComponent, {
            data: {
              windowType: this.switchAcc ? 'TRANSFER_TO_ACCOUNT' : 'CARD_CORPORATE',
              saldo: {
                amount: formValue.employeesItems[0].amountTransferToCard,
              },
              recipient: {
                name: this.switchAcc ? this.choosedAcount().altAcctId : this.choosedCorpCardAcount().pan
              },
              transactionId: res?.parentId
            }
          });
        },
        error: (err) => {
          this.toastrService.error(err.errorMessage || err || 'Что-то пошло не так!');
          this.utilsService.spinnerState$$.next(false);
          this.getDocDate();
          this._cdRef.detectChanges();
        }
      })
  }

  submit() {
    const isKartoteka = this.activatedRoute.snapshot.queryParamMap.get('isKartoteka');

    this.signFormBudget.markAllAsTouched();
    if (this.signFormBudget.invalid) {
      this.signFormBudget.markAllAsTouched();
      return;
    }
    this.utilsService.spinnerState$$.next(true);

    const isoDate = this.signFormBudget.value.docDate
    const d = new Date(isoDate)
    const formatted = d.toLocaleDateString('ru-RU')
    const amount = this.signFormBudget.getRawValue()?.amount;
    const amountInCents = Math.round(amount * 100);
    this.signFormBudget.patchValue({
      docDate: formatted,
      senderAccount: this.choosedAcount()?.altAcctId,
      transitAccount: this.choosedCorpCardAcount()?.transitAccount,
      contractNumber: this.choosedCorpCardAcount()?.contractNumber,
      mode: this.switchAcc ? 'DR' : 'CR',
    })
    const formValue = {
      employeesItems : [
        {
          fio : this.choosedCorpCardAcount()?.ownerName,
          amountTransferToCard : amountInCents,
          accountNumberCard : this.choosedCorpCardAcount()?.account,
          maskedPan: this.choosedCorpCardAcount()?.pan
        }
      ],
      salaryPrepareReq: {
        ...this.signFormBudget.getRawValue(),
        paymentSource: isKartoteka === 'kartoteka' ? (this.signFormBudget.getRawValue().neotlojka ? 'NEOTLOJKA' : this.signFormBudget.getRawValue().bron ? 'BRON' :'ACCOUNT'): 'ACCOUNT',
      }
    };
    delete formValue.salaryPrepareReq.amount
    delete formValue.salaryPrepareReq.purpose
    delete formValue.salaryPrepareReq.bron
    delete formValue.salaryPrepareReq.neotlojka
    this.accountsPaymentService.prepareCorpCardTransaction(formValue).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res){
            this.analyticsService.logFirebaseCustomEvent('create_payment_order_success', null);
            this.analyticsService.logFirebaseCustomEvent('create_payment_order_screen_jump', null);
          }
          this.utilsService.spinnerState$$.next(false);
          this.matDialog.open(PaymentSuccessModalComponent, {
            data: {
              windowType: this.switchAcc ? 'TRANSFER_TO_ACCOUNT' : 'CARD_CORPORATE',
              saldo: {
                amount: formValue.employeesItems[0].amountTransferToCard,
              },
              recipient: {
                name: this.switchAcc ? this.choosedAcount().altAcctId : this.choosedCorpCardAcount().pan
              },
              transactionId: res?.parentId
            }
          });
        },
        error: (err) => {
          this.analyticsService.logFirebaseCustomEvent('payment_failed', {platform: "web"});
          this.toastrService.error(err.errorMessage || err || 'Что-то пошло не так!');
          this.utilsService.spinnerState$$.next(false);
          this.getDocDate();
          this._cdRef.detectChanges();
        }
      })
  }

  protected readonly Number = Number;
  protected readonly length = length;
}
