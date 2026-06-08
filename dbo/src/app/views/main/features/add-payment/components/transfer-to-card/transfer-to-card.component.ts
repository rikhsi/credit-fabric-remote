import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  HostListener,
  OnInit,
  signal
} from "@angular/core";
import {CommonModule} from "@angular/common";
import {ActivatedRoute, Router, RouterModule} from "@angular/router";
import {AmountService} from "../../../../../../core/services/amount.service";
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {
  AccountsDto,
  BudgetReferenceContentDto,
  CodePurposeContent
} from "../../../accounts-payments/models/accounts-payments.model";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {AccountsListPaymentsComponent} from "../../modals/account-list-modal/account-list-modal.component";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {NgxMaskDirective, NgxMaskPipe} from "ngx-mask";
import {UserInfoDto} from "../../../../../../core/models/user.model";
import {ToastrService} from "ngx-toastr";
import {PaymentService, PurposeTypes} from "../../../../../../core/services/payment.service";
import {AccountService} from "../../../../../../core/services/account.service";
import {AccountsPaymentsService} from "../../../accounts-payments/services/accounts-payments.service";
import {CodePurposeModalComponent} from "../../modals/code-purpose/code-purpose-modal.component";
import {debounceTime, distinctUntilChanged, Subject} from "rxjs";
// import {TemplateNameComponent} from "../../../template-transactions/components/template-name/template-name.component";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {filter} from "rxjs/operators";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatNativeDateModule} from "@angular/material/core";
import {animate, style, transition, trigger} from "@angular/animations";
import {UtilsService} from "../../../../../../core/services/utils.service";
import {Account} from "../transfer-to-account/transfer-to-account.component";
import {
  TemplateSuccessModalComponent
} from "../../../../../../shared/components/template-success-modal/template-success-modal";
import {
  PaymentSuccessModalComponent
} from "../../../../../../shared/components/payment-success-modal/payment-success-modal";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {FirebaseAnalyticsService} from "../../../../../../../../firebase-analytics.service";
import {MatTooltip} from "@angular/material/tooltip";
import {TransactionService} from "../../../../../../core/services/transaction.service";
import {InfoModalComponent} from "../../../kartoteka/kartoteka-2/components/info-modal/info-modal.component";
import { NumericOnlyDirective } from "src/app/shared/directives/numeric-only.directive";
import {CancelModalComponent} from "../../../template-transactions/components/cancel-modal/cancel-modal.component";

@Component({
  selector: 'app-transfer-to-card',
  imports: [ NumericOnlyDirective, CommonModule, MatDatepickerModule, MatFormFieldModule, MatInputModule, MatNativeDateModule, RouterModule, ReactiveFormsModule, NgxMaskDirective, NgxMaskPipe, FormsModule, TranslateModule, MatTooltip],
  templateUrl: './transfer-to-card.component.html',
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
export class TransferToCardComponent implements OnInit {
  isOpen = false;
  openAccount = false;
  openFindPurposes = false;
  openFindMfo = false;
  templateCreateModal = false;
  purposeCodeForCheck: any = null
  touched = false;
  selectedAccount!: AccountsDto | null | undefined;
  accounts!: any[];
  mfoList: any[] = [];
  bankName: string = "";
  fromQuery = '';
  purposePage = 0;
  descriptionPurpose: any = {};
  businessInfo: UserInfoDto | Record<string, any> = {};
  templateList = signal<any[]>([])
  bronAndReserves = signal<any[]>([])
  setError = signal<boolean>(false);

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
    private amountsService: AmountService,
    private translate: TranslateService,
    public router: Router,
    private accountsPaymentService: AccountsPaymentsService,
    private analyticsService: FirebaseAnalyticsService,
    private transactionService: TransactionService
  ) {
  }

  transferForm = this.fb.nonNullable.group({
    template: ''
  });

  amountInWords = '';
  purposes: CodePurposeContent[] | [] = [];
  purposesPayment: CodePurposeContent[] | [] = [];
  codeInput: boolean = false;
  templateName = '';
  minDate = signal<any>('');
  templateError = false;
  mfoCode = '';
  templateId = '';
  searchPurposeText = signal<string>('');
  purposesAfterFilter = signal<any[]>([])
  cardInfo = signal<any>({});
  recipientDetail = signal<any>({});
  choosedAcount = signal<Account | Record<string, any>>({});
  balanceErrorOver = "";
  private dialogRef: MatDialogRef<CodePurposeModalComponent> | null = null;
  inputSubject = new Subject<any>();
  docNumSubject = new Subject<any>();

  signFormBudget: FormGroup = new FormGroup({
    templateId: new FormControl(null),
    purposeType: new FormControl('', Validators.required),
    purposeName: new FormControl('', Validators.required),
    fromAnor: new FormControl(false),
    isSaved: new FormControl(false),
    name: new FormControl(''),
    recipientName: new FormControl(''),
    recipientTax: new FormControl(''),
    bron: new FormControl(false),
    neotlojka: new FormControl(false),
    balance: new FormGroup({
      amount: new FormControl(null, [Validators.required, Validators.min(0.01)]),
      scale: new FormControl(2),
      currency: new FormControl('UZS'),
    }),
    amount: new FormGroup({
      amount: new FormControl(''),
    }),
    docNumber: new FormControl(''),
    docDate: new FormControl(null),
    sender: new FormGroup({
      account: new FormControl('', Validators.required),
    }),
    purpose: new FormGroup({
      name: new FormControl('', Validators.required),
      code: new FormControl(''),
    }),
    recipientMfo: new FormControl('', Validators.required),
    recipientMfoName: new FormControl(''),
    recipientAccount: new FormControl('', [Validators.required, Validators.minLength(20), Validators.maxLength(20)]),
    pan: new FormControl('', Validators.required),
  });

  getCardInfo(event: any) {
    const isKartoteka = this.activatedRoute.snapshot.queryParamMap.get('isKartoteka');

    this.setError.set(false);
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
        if (res) {
          this.cardInfo.set(res)
          if (res.recipientAccount?.length > 0) {
            this.getReferences(res.recipientAccount)
          }
          if (isKartoteka !== 'kartoteka') {
            this.signFormBudget.patchValue({
              recipientMfo: res.mfo,
              recipientAccount: res.recipientAccount,
            })
          }
        } else {
          this.setError.set(true);
        }
      })
      this._cdRef.detectChanges()
    } else {
      this.cardInfo.set({});
      this._cdRef.detectChanges()
    }
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
    this.utilsService.spinnerState$$.next(true);
    const isoDate = this.signFormBudget.value.docDate
    const d = new Date(isoDate)
    const formatted = d.toLocaleDateString('ru-RU')
    const amount = this.signFormBudget.getRawValue().balance.amount;
    const amountInCents = Math.round(amount * 100);
    this.signFormBudget.patchValue({
      docDate: formatted,
      amount: {
        amount: amountInCents,
      },
      isSaved: true,
      name: this.templateName,
      sender: {
        account: this.choosedAcount().altAcctId,
      }
    })
    const formValue = {...this.signFormBudget.getRawValue()};
    delete formValue.balance;
    delete formValue.recipientMfoName;
    this.accountsPaymentService.prepareCardTransaction(formValue).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        {
          next: () => {
            this.templateCreateModal = false;
            this.utilsService.spinnerState$$.next(false);
            this.matDialog.open(TemplateSuccessModalComponent, {
              data: []
            });
          },
          error: (err) => {
            this.getDocDate();
            this.utilsService.spinnerState$$.next(false);
            this.toastrService.error(err.errorMessage || err || 'Что-то пошло не так!');
          }
        })
  }

  templateCreateClick() {
    if (this.activatedRoute.snapshot.queryParamMap.get('type') === 'create' || this.activatedRoute.snapshot.queryParamMap.get('type') === 'edit') {
      this.createTemplate()
    } else {
      this.templateCreateModal = true
    }
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
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

  onAmountKeydown(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;

    // Считаем только цифры, без пробелов маски
    const digitsOnly = input.value.replace(/\D/g, '');

    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];

    if (digitsOnly.length >= 16 && !allowedKeys.includes(event.key)) {
      event.preventDefault();
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
    const mode = this.activatedRoute.snapshot.queryParamMap.get('mode');
    const kartotekaType = this.activatedRoute.snapshot.queryParamMap.get('kartotekaType');
    this.transactionService.checkKartoteka('TO_PHYSICAL_CARD').pipe().subscribe((res: any) => {
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
          this.signFormBudget.patchValue({
            sender: {
              account: acc.altAcctId,
            }
          })
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
          this.signFormBudget.patchValue({
            sender: {
              account: acc.altAcctId,
            }
          })
        }, 1000)
      }
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


  checkCode() {
    const findPurpose = this.purposes.find(purpose => purpose.code === this.purposeCodeForCheck);
    if (!findPurpose) {
      this.signFormBudget.get('purpose.name')?.markAsTouched()
    }
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
        windowType: ["ACCOUNT_TO_PHYSICAL_CARD"],
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

  getPurposesPayment() {
    this.accountService.getPurposesPayment().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => {
      this.purposesPayment = res.purposes;
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
        bankName: data.recipientName,
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
        this.recipientDetail.set(foundReference)
      } else {
      }
      this._cdRef.markForCheck();
    });
  }

  getReferences(event: any, type?: 'input' | 'text') {
    const accountValue = type === 'input' ? event.target.value : event;
    if (accountValue.length < 20) {
      this.resetRecipientForm();
      return;
    }
    if (accountValue.length === 20) {
      this.getAccountReferences(accountValue);
    }
  }

  getDocNumber() {
    this.paymentService.getPaymentDocNum().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => {
      this.signFormBudget.patchValue({
        docNumber: res.msg
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
    if (!this.templateName) {
      this.templateError = true;
      return;
    }
    const amount = this.signFormBudget.getRawValue().balance.amount;
    const amountInCents = Math.round(amount * 100);
    const formValue = {
      sender: {
        account: this.choosedAcount().altAcctId,
        pinfl: "",
      },
      purpose: {
        name: this.signFormBudget.getRawValue().purpose.name,
        code: this.signFormBudget.getRawValue().purpose.code
      },
      saldo: {
        amount: amountInCents,
        scale: 2,
        currency: 'UZS'
      },
      recipient: {
        codeFilial: this.signFormBudget.getRawValue().recipientMfo,
        account: this.signFormBudget.getRawValue().recipientAccount,
        bankName: this.recipientDetail()?.recipientName,
        tax: this.recipientDetail()?.inn,
        pinfl: "",
        name: this.cardInfo()?.owner,
      },
      name: this.templateName,
      description: this.signFormBudget.getRawValue().purposeName,
      additionalInfo: {
        pan: this.signFormBudget.getRawValue().pan,
        purposeType: this.signFormBudget.getRawValue().purposeType
      }
    };
    this.paymentService.editTemplateReq(formValue, this.templateId);
  }

  setTemplateName(event: any) {
    this.templateError = event.target.value?.length <= 0;
    this.templateName = event.target.value;
  }

  setTemplateToForm(templateDetails: any) {
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
      templateId: templateDetails.id,
      purposeType: templateDetails.additionalInfo.purposeType,
      purposeName: templateDetails.description,
      balance: {
        amount: templateDetails.senderAmount.amount / 100,
        scale: (2),
        currency: ('UZS'),
      },
      amount: {
        amount: templateDetails.senderAmount.amount / 100,
      },
      sender: {
        account: this.bronAndReserves()?.length > 0 ? this.choosedAcount() : account?.status === 'BLOCKED' ? {} : account?.account ? account : this.choosedAcount(),
      },
      purpose: templateDetails.additionalInfo.purposeType,
      recipientMfo: '',
      recipientMfoName: '',
      recipientAccount: '',
      pan: templateDetails.additionalInfo.pan,
    })
    this.accountService.getCardPurposes({
      pan: templateDetails.additionalInfo.pan,
      purposeType: templateDetails.additionalInfo.purposeType
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => {
      this.signFormBudget.patchValue({
        purposeName: res.purpose
      })
      this._cdRef.detectChanges()
    })
    this.accountService.getCardInfo({pan: templateDetails.additionalInfo.pan}).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => {
      this.cardInfo.set(res)
      if (res.recipientAccount?.length > 0) {
        this.getReferences(res.recipientAccount)
      }
      this.signFormBudget.patchValue({
        recipientMfo: res.mfo,
        recipientAccount: res.recipientAccount,
      })
    })
    this._cdRef.detectChanges();
  }

  editTransaction() {
    const isKartoteka = this.activatedRoute.snapshot.queryParamMap.get('isKartoteka');

    this.signFormBudget.markAllAsTouched();
    if (this.signFormBudget.invalid) {
      this.signFormBudget.markAllAsTouched();
      return;
    }
    const amount = this.signFormBudget.getRawValue().balance.amount;
    const amountInCents = Math.round(amount * 100);
    this.utilsService.spinnerState$$.next(true);
    this.signFormBudget.patchValue({
      amount: {
        amount: amountInCents,
        scale: 2,
        currency: "UZS"
      },
      sender: {
        account: this.choosedAcount().altAcctId,
        pinfl: null,
      }
    })
    const formValue = {
      ...this.signFormBudget.getRawValue(),
      id: this.activatedRoute.snapshot.queryParamMap.get('transactionId'),
      paymentSource: isKartoteka === 'kartoteka' ? (this.signFormBudget.getRawValue().neotlojka ? 'NEOTLOJKA' : this.signFormBudget.getRawValue().bron ? 'BRON' :'ACCOUNT'): 'ACCOUNT'
    };
    delete formValue.balance;
    delete formValue.recipientMfoName;
    delete formValue.isSaved;
    delete formValue.docNumber;
    delete formValue.docDate;
    delete formValue.bron;
    delete formValue.neotlojka;
    delete formValue.name;
    this.accountsPaymentService.editCardTransaction(formValue).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.utilsService.spinnerState$$.next(false);
          this.matDialog.open(PaymentSuccessModalComponent, {
            data: {
              windowType: 'CARD',
              mode: 'edit',
              saldo: {
                amount: formValue.amount.amount,
              },
              recipient: {
                name: formValue.pan
              }
            }
          });
        },
        error: (err) => {
          this.getDocDate();
          this.utilsService.spinnerState$$.next(false);
          this.toastrService.error(err.message || err);
        }
      })
  }

  getTemplateDetails(templateId: string) {
    this.accountsPaymentService.getSavedPaymentDetails(templateId).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (templateDetails: any) => {
          setTimeout(() => {
            const account = this.accounts.find(acc => acc.altAcctId === templateDetails.sender.account);
            if (account) {
              this.choosedAcount.set(account)
            }
            this.signFormBudget.patchValue({
              purposeType: templateDetails.additionalInfo.purposeType,
              purposeName: templateDetails.description,
              balance: {
                amount: templateDetails.senderAmount.amount / 100,
                scale: (2),
                currency: ('UZS'),
              },
              amount: {
                amount: templateDetails.senderAmount.amount / 100,
              },
              sender: {
                account: account ? this.accounts[0] : this.choosedAcount(),
              },
              purpose: templateDetails.additionalInfo.purposeType,
              recipientMfo: '',
              recipientMfoName: '',
              recipientAccount: '',
              pan: templateDetails.additionalInfo.pan,
            })
            this.accountService.getCardPurposes({
              pan: templateDetails.additionalInfo.pan,
              purposeType: templateDetails.additionalInfo.purposeType
            }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => {
              this.signFormBudget.patchValue({
                purposeName: res.purpose
              })
              this._cdRef.detectChanges()
            })
            this.accountService.getCardInfo({pan: templateDetails.additionalInfo.pan}).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => {
              this.cardInfo.set(res)
              if (res.recipientAccount?.length > 0) {
                this.getReferences(res.recipientAccount)
              }
              this.signFormBudget.patchValue({
                recipientMfo: res.mfo,
                recipientAccount: res.recipientAccount,
              })
            })
          }, 500)
        },
        complete: () => {
          this._cdRef.markForCheck();
        }
      })
  }

  openKartoteka2Info(type: string) {
    this.matDialog.open(InfoModalComponent, {
      data: {type: type},
      width: "481px",
      minHeight: "426px"
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
            this.signFormBudget.patchValue({
              purposeType: templateDetails.additionalInfo.purposeType,
              purposeName: templateDetails.description,
              bron: templateDetails.paymentSource === 'BRON',
              neotlojka: templateDetails.paymentSource === 'NEOTLOJKA',
              balance: {
                amount: templateDetails.senderAmount.amount / 100,
                scale: (2),
                currency: ('UZS'),
              },
              amount: {
                amount: templateDetails.senderAmount.amount / 100,
              },
              sender: {
                account: account?.status === 'BLOCKED' ? {} : account?.account ? account : this.choosedAcount(),
              },
              purpose: templateDetails.additionalInfo.purposeType,
              recipientMfo: '',
              recipientMfoName: '',
              recipientAccount: '',
              pan: templateDetails.additionalInfo.pan,
            })
            this.accountService.getCardPurposes({
              pan: templateDetails.additionalInfo.pan,
              purposeType: templateDetails.additionalInfo.purposeType
            }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => {
              this.signFormBudget.patchValue({
                purposeName: res.purpose
              })
              this._cdRef.detectChanges()
            })
            this.accountService.getCardInfo({pan: templateDetails.additionalInfo.pan}).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => {
              this.cardInfo.set(res)
              if (res.recipientAccount?.length > 0) {
                this.getReferences(res.recipientAccount)
              }
              this.signFormBudget.patchValue({
                recipientMfo: res.mfo,
                recipientAccount: res.recipientAccount,
              })
            })
          }, 500)
        },
      })
  }

  ngOnInit(): void {

    const type = this.activatedRoute.snapshot.queryParamMap.get('type');
    const isKartoteka = this.activatedRoute.snapshot.queryParamMap.get('isKartoteka');
    const kartotekaType = this.activatedRoute.snapshot.queryParamMap.get('kartotekaType');

    this.analyticsService.logFirebaseCustomEvent('create_transfer_screen_jump', null);
    this.getMfoList();
    this.getPurposesPayment()
    this.getDocDate();
    this.getDocNumber();
    this.getTemplates();
    this.getAccounts1();
    this.getPurposeList();


    if (isKartoteka === 'kartoteka') {
      this.getKartotekaData();
      const recipientName = this.signFormBudget.get('recipientName');
      const recipientTax = this.signFormBudget.get('recipientTax');

      if (isKartoteka === 'kartoteka') {
        recipientName?.setValidators([Validators.required]);
        recipientTax?.setValidators([Validators.required]);
      } else {
        recipientName?.clearValidators();
        recipientTax?.clearValidators();
      }

      recipientName?.updateValueAndValidity();
      recipientTax?.updateValueAndValidity();
    }

    if (kartotekaType) {
      this.signFormBudget.patchValue({
        bron: kartotekaType === 'bron',
        neotlojka: kartotekaType === 'neotlojka',
      })
    }

    this.inputSubject
      .pipe(debounceTime(800), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((val) => {
        this.mfoCode = val.target.value
        this.getMfoList();
        this.openFindMfo = true;
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
    setTimeout(() => console.log(this.signFormBudget.value, "vv"), 2000)
    setTimeout(() => console.log(this.choosedAcount(), "23"), 2000)
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

  checkDocNum(value) {
    this.paymentService.checkDocNumber(value?.target.value)
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
    const entered = this.parseNumber(formValue?.balance?.amount ?? 0);
    const max = this.parseNumber(maxAmount);

    let validAmount = entered;
    if (entered > max) {
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

  getPurposeList() {
    this.paymentService.getPurposes({
      page: 0,
      size: 30,
      searchText: ''
    }, PurposeTypes.PHYSICAL_CARD).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res: any) => {
        this.signFormBudget.patchValue({
          purpose: {
            code: res?.content[0].code,
            name: res?.content[0].name
          }
        })
        this._cdRef.detectChanges();
      },
      complete: () => {
        this._cdRef.markForCheck();
      }
    })
  }

  getDocDate() {
    if (this.activatedRoute.snapshot.queryParamMap.get('type') !== 'edit') {
      this.accountService.getOperDayNew().pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(res => {
          const [day, month, year] = res.operDay.split('.').map(Number);

          const formattedDate = new Date(year, month - 1, day);
          this.signFormBudget.patchValue({
            docDate: formattedDate,
          })
          this.minDate.set(formattedDate);
        })
      this._cdRef.detectChanges();
    }
  }

  submit() {
    const isKartoteka = this.activatedRoute.snapshot.queryParamMap.get('isKartoteka');
    // this.checkPaymentAllowed();
    this.signFormBudget.markAllAsTouched();
    if (this.signFormBudget.invalid) {
      this.signFormBudget.markAllAsTouched();
      return;
    }
    if(this.setError()) {
      return;
    }
    this.utilsService.spinnerState$$.next(true);
    const isoDate = this.signFormBudget.value.docDate
    const d = new Date(isoDate)
    const formatted = d.toLocaleDateString('ru-RU')
    const amount = this.signFormBudget.getRawValue().balance.amount;
    const amountInCents = Math.round(amount * 100);
    this.signFormBudget.patchValue({
      docDate: formatted,
      amount: {
        amount: amountInCents
      },
      sender: {
        account: this.choosedAcount().altAcctId,
      }
    })
    const formValue = {
      ...JSON.parse(JSON.stringify(this.signFormBudget.getRawValue())),
      paymentSource: isKartoteka === 'kartoteka' ? (this.signFormBudget.getRawValue().neotlojka ? 'NEOTLOJKA' : this.signFormBudget.getRawValue().bron ? 'BRON' :'ACCOUNT'): 'ACCOUNT'
    };
    delete formValue.balance;
    delete formValue.recipientMfoName;
    delete formValue.bron;
    delete formValue.neotlojka;
    if (isKartoteka !== 'kartoteka') {
      delete formValue.recipientName;
      delete formValue.recipientTax;
    }
    this.accountsPaymentService.prepareCardTransaction(formValue).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res) {
            this.analyticsService.logFirebaseCustomEvent('create_transfer_success', {transfer_id: res?.id || undefined});
            this.analyticsService.logFirebaseCustomEvent('create_payment_order_success', null);
            this.analyticsService.logFirebaseCustomEvent('create_payment_order_screen_jump', null);
          }
          this.utilsService.spinnerState$$.next(false);
          this.matDialog.open(PaymentSuccessModalComponent, {
            data: {
              windowType: 'CARD',
              saldo: {
                amount: formValue.amount.amount,
              },
              recipient: {
                name: formValue.pan
              },
              transactionId: res?.id
            }
          });
        },
        error: (err) => {
          this.analyticsService.logFirebaseCustomEvent('payment_failed', {platform: "web"});
          this.getDocDate();
          this.utilsService.spinnerState$$.next(false);
          this.toastrService.error(err.message || err);
        }
      })
  }

  protected readonly Number = Number;
  protected readonly length = length;
}
