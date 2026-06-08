import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef, inject,
  OnInit,
  signal
} from '@angular/core';
import {WidgetsComponent} from '../../../../../../shared/components/widgets/widgets.component';
import {ContainerTitleComponent} from '../../../../../../shared/components/container-title/container-title.component';
import {ContainerNavComponent} from '../../../../../../shared/components/container-nav/container-nav.component';
import {ActivatedRoute, Router} from '@angular/router';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

import {AccountsPaymentsService} from '../../../accounts-payments/services/accounts-payments.service';
import {AccountsDto} from '../../../accounts-payments/models/accounts-payments.model';
import {AccountSelectComponent} from '../../../../../../shared/components/account-select/account-select.component';
import {MatAccordion, MatExpansionPanel} from '@angular/material/expansion';
import {UserService} from '../../../../../../core/services/user.service';
import {NgClass, NgIf, NgOptimizedImage} from '@angular/common';
import {MatError, MatFormField, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatOption, MatSelect} from '@angular/material/select';
import {TransactionTypes} from '../../../../../../core/models/transaction.models';
import {MatIcon} from '@angular/material/icon';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatInput} from '@angular/material/input';
import {NgxMaskDirective} from 'ngx-mask';
import {MoreActionsComponent} from '../../../new-payment/components/more-actions/more-actions.component';
import {UtilsService} from '../../../../../../core/services/utils.service';
import {PaymentService, PurposeTypes} from '../../../../../../core/services/payment.service';
import {ToastrService} from 'ngx-toastr';
import {LoanService} from "../../../loans/services/loan.service";
import {LoanDetail, PreparePaymentRequest} from "../../../loans/models/loan.model";
import {LoanInfoComponent} from "../../../loans/components/loan-info/loan-info.component";
import {RightBarService} from "../../../../right-bar/services/right-bar.service";
import {DepositService} from "../../services/deposit.service";
import {MyDepositsDto} from "../../models/deposits.model";
import {AmountService} from "../../../../../../core/services/amount.service";
import {
  SearchableSelectComponent
} from "../../../../../../shared/components/searchable-select/searchable-select.component";
import {TemplateNameComponent} from "../../../template-transactions/components/template-name/template-name.component";
import { EspSignConfirmService } from '../../../../../../core/services/esp-confirm.service';

@Component({
    selector: 'app-loan-pay',
    imports: [
        WidgetsComponent,
        ContainerTitleComponent,
        ContainerNavComponent,
        LoanInfoComponent,
        AccountSelectComponent,
        MatAccordion,
        MatExpansionPanel,
        NgOptimizedImage,
        MatFormField,
        MatSelect,
        MatOption,
        MatIcon,
        ReactiveFormsModule,
        MatInput,
        MatLabel,
        NgxMaskDirective,
        NgClass,
        MatError,
        NgIf,
        MoreActionsComponent,
        MatSuffix,
        SearchableSelectComponent
    ],
    templateUrl: './deposit-top-up.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositTopUpComponent implements OnInit {
  docNum = signal('')
  purposes: any[] = [];
  title = computed(() => `Пополнение № ${this.docNum()} от ${this.docDate()}`)
  navs = [
    {
      title: 'Главная',
      link: '/'
    },
    {
      title: 'Мои депозиты',
      link: '/deposits/my-deposits'
    },
    {
      title: ' Пополнение депозита',
      link: '/'
    },
  ];
  docDate = signal('');
  depositId = signal<number>(0)
  depositDetail = signal<MyDepositsDto | undefined>({} as MyDepositsDto)
  accounts!: AccountsDto[];
  receiverAccountTouched = false;
  isOpenRequisites = false;
  businessUser!: any;
  amountInWords = ''
  purposePage = 0;
  purposeSize = 20;
  searchPurposeText = '';

  paymentDescription = '';
  private _rightBarService = inject(RightBarService)
  private _depositService = inject(DepositService)
  public amountService = inject(AmountService)
  signForm: FormGroup = new FormGroup({
    transactionMode: new FormControl('DEPOSIT_TOP_UP'),
    windowType: new FormControl('BETWEEN_ACCOUNTS'),
    saldo: new FormGroup({
      amount: new FormControl('', Validators.required),
      scale: new FormControl(2),
      currency: new FormControl('UZS'),
    }),
    docNum: new FormControl(''),
    docDate: new FormControl(new Date().toISOString()),
    sender: new FormGroup({
      account: new FormControl('', Validators.required),
      pinfl: new FormControl(''),
    }),
    recipient: new FormGroup({
      account: new FormControl('', [Validators.minLength(20), Validators.maxLength(27), Validators.required]),
      codeFilial: new FormControl(''),
      tax: new FormControl('01095'),
      name: new FormControl(''),
      pinfl: new FormControl(null),
    }),
    purpose: new FormControl(''),
    description: new FormControl(this.paymentDescription),
  });



  constructor(
    private _cdRef: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    private destroyRef: DestroyRef,
    private accountsPaymentsService: AccountsPaymentsService,
    private userService: UserService,
    private fb: FormBuilder,
    private utilsService: UtilsService,
    private router: Router,
    private paymentService: PaymentService,
    private toastrService: ToastrService,
    private espConfirmService: EspSignConfirmService,
  ) {
  }

  ngOnInit() {
    this.initDepositId();
    this.getAccountsList();
    this.getDocNum();
    this.getBusinessUserInfo();
    this.getOperationDay()
    this.activatedRoute.params.subscribe(params=>{
      this.signForm.patchValue({
        recipient:{
          account:params['attachedAccount']
        }
      })
    })
  }

  setSenderAccount(acc: AccountsDto) {
    this.signForm.patchValue({
      sender:{
        account:acc.altAcctId
      }
    });
    this.receiverAccountTouched = false;
  }

  getOperationDay() {
    this._rightBarService.getOperDay()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(val => {
        if (val) {
          this.docDate.set(val?.currentWorkingDate.toString())
          this.signForm.patchValue({
            docDate: this.docDate()

          })
        }
      })
  }


  convertAmountIntoWords() {
    const saldoRawValue = this.signForm.get('saldo')?.getRawValue();
    const amount = saldoRawValue?.amount;
    if(amount) {
      this.amountInWords = this.amountService.numberToWordsRU(amount);
    } else {
      this.amountInWords = '';
    }
  }

  initDepositId() {
    this.activatedRoute.params
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const depositId = res['id'];
          if (depositId) {
            this.depositId.set(depositId)
          }
          this.getDepositInfo();
        }
      })
  }

  getAccountsList() {
    this.accountsPaymentsService.getPaymentAllowed({page: 0, size: 100}, {
      senderAccount: null,
      transactionMode: 'DEPOSIT_TOP_UP'
    }).subscribe(res => {
      if (!res) return;
      this.accounts = res.content;
    })
  }

  getDepositInfo() {
    // this._depositService.getMyDeposits()
    //   .pipe(takeUntilDestroyed(this.destroyRef))
    //   .subscribe({
    //     next: (res) => {
    //       if (res) {
    //         this.depositDetail.set(res.find(el => el.savDepId === Number(this.depositId())));
    //         console.log(this.depositDetail());
    //       }
    //     }
    //   })
  }

  selectAction(event: any) {
    if (event.value == 'create') {
      this.submit();
    }
  }

  checkTouchedReceiver() {
    const account = this.signForm.get('sender')?.get('account') as FormControl
    this.receiverAccountTouched = Boolean(account.invalid && account.touched);
  }

  toggleRequisites() {
    this.isOpenRequisites = !this.isOpenRequisites;
  }

  getBusinessUserInfo() {
    this.userService.userInfo$$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.businessUser = res?.business;
      });
  }

  getDocNum() {
    this.paymentService.getPaymentDocNum()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(val => {
        if (val) {
          this.docNum.set(val.msg);
          this.signForm.patchValue({
            docNum: val.msg
          })
        }
      });
  }

  setDocDate(date: any) {
    this.docDate.set(date)
    this.signForm.patchValue({
      docDate: date.toISOString(),
    })
  }
  displayOption(option: any){
    if(option) {
      return `${option.code} - ${option.name}`;
    }
    return '';
  }

  scrollPurpose() {
    if(this.purposes.length < this.purposeSize) {
      return;
    }
    this.purposePage++;
    this.getPurposes();
  }

  searchPurpose(searchText : string) {
    this.searchPurposeText = searchText;
    this.purposePage = 0;
    this.getPurposes();
  }
  checkPaymentAllowed(type = 'SAVE') {
    const form = this.signForm.getRawValue();
    const data = {
      senderAccount: form.sender.account,
      recipientAccount: null,
      transactionMode: this.signForm.value.transactionMode
    }
    this.accountsPaymentsService.checkPaymentAllowed(data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(val => {
        if(val) {
          if(type == 'EDIT') {
          } else if(type === 'SEND') {
            this.topUp(type);
          } else {
            this.topUp();
          }
        }
      })
  }

  sendTopUp(id: string) {
    this.espConfirmService.paymentSign({
      type: 'DEPOSIT_TOP_UP',
      id,
      hash: ''
    }).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.toastrService.success('Успешно!');
          this.router.navigate(['/accounts-and-payments'], {
            queryParams: {
              tab: 'payments'
            }
          })
        },
        error: (err) => {
          this.toastrService.error(err.message || err || 'Что-то пошло не так!');
        }
      })
  }

  topUp(type = 'save') {
    this.utilsService.spinnerState$$.next(true);
    this._depositService.prepareTopUp({
      docNum: this.signForm.getRawValue().docNum,
      docDate: this.signForm.getRawValue().docDate,
      amount: this.signForm.getRawValue().saldo.amount * 100,
      currency: `${this.depositDetail()?.currency}`,
      accountNumber: this.signForm.getRawValue().sender.account,
      arrangementId: `${this.depositDetail()?.savDepId}`,
      depositAccount: `${this.depositDetail()?.account}`,
    }).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if(!res) return;
          if(type === 'SEND') {
            this.sendTopUp(res.id);
          }
          else {
            this.toastrService.success('Успешно!');
            this.router.navigate(['/accounts-and-payments'], {
              queryParams: {
                tab: 'payments'
              }
            })
          }
        },
        error: (err) => {
          this.toastrService.error(err.message || err || 'Что-то пошло не так!');
        }
      });
  }


  submit(type = 'SAVE') {
    this.signForm.markAllAsTouched();
    this.checkTouchedReceiver();
    if(this.signForm.valid) {
      this.checkPaymentAllowed(type);
    }
  }
  getPurposes() {
    let purposeType: PurposeTypes = PurposeTypes.PAYMENT_UZS;
    // if(this.selectedAccount?.balance?.currency === 'UZS') {
    //   purposeType = PurposeTypes.PAYMENT_UZS;
    // }
    this.paymentService.getPurposes(
      {
        page: this.purposePage,
        size: this.purposeSize,
        searchText: this.searchPurposeText,
      },
      purposeType
    ).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ((res) => {
          const content = res?.content
          if(content && Array.isArray(content)) {

            if(this.purposePage === 0) {
              this.purposes = content;
            } else {
              this.purposes = [...this.purposes, ...content];
            }
          }
        }),
        complete:() => {
          this._cdRef.markForCheck();
        }
      })
  }
}
