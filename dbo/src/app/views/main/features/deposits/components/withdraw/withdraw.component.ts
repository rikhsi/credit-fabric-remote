import {ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {ContainerNavComponent} from "../../../../../../shared/components/container-nav/container-nav.component";
import {ContainerTitleComponent} from "../../../../../../shared/components/container-title/container-title.component";
import { ActivatedRoute, Router } from '@angular/router';
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {DepositService} from "../../services/deposit.service";
import { MyDepositsDto, WithdrawRequest } from '../../models/deposits.model';
import {AmountService} from "../../../../../../core/services/amount.service";
import {NgIf, NgOptimizedImage} from "@angular/common";
import {AccountSelectComponent} from "../../../../../../shared/components/account-select/account-select.component";
import {AccountsPaymentsService} from "../../../accounts-payments/services/accounts-payments.service";
import {AccountsDto} from "../../../accounts-payments/models/accounts-payments.model";
import {MatAccordion, MatExpansionPanel} from "@angular/material/expansion";
import {UserService} from "../../../../../../core/services/user.service";
import {an} from "@fullcalendar/core/internal-common";
import {MatFormField, MatLabel, MatSuffix} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {NgxMaskDirective} from "ngx-mask";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {
  SearchableSelectComponent
} from "../../../../../../shared/components/searchable-select/searchable-select.component";
import {PaymentService, PurposeTypes} from "../../../../../../core/services/payment.service";
import {RightBarService} from "../../../../right-bar/services/right-bar.service";
import {formatMonth} from "../../../payroll-project/constants/table-columns";
import {MoreActionsComponent} from "../../../new-payment/components/more-actions/more-actions.component";
import {UtilsService} from "../../../../../../core/services/utils.service";
import { ToastrService } from 'ngx-toastr';
import { EspSignConfirmService } from '../../../../../../core/services/esp-confirm.service';

@Component({
    selector: 'app-withdraw',
    imports: [
        ContainerNavComponent,
        ContainerTitleComponent,
        NgIf,
        AccountSelectComponent,
        MatAccordion,
        MatExpansionPanel,
        NgOptimizedImage,
        MatFormField,
        MatInput,
        MatLabel,
        MatSuffix,
        NgxMaskDirective,
        ReactiveFormsModule,
        SearchableSelectComponent,
        MoreActionsComponent
    ],
    templateUrl: './withdraw.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WithdrawComponent implements OnInit {
  isClose = false;
  purposes = signal<any[]>([])
  purposePage = signal(0);
  purposeSize = signal(20)
  searchPurposeText = signal('');
  businessUser = signal<any>({})
  isOpenRequisites = signal(false)
  docDate = signal('');
  amountInWords = signal('');
  depositId = signal('');
  attachedAccount = signal('');
  docNum = signal('');
  accounts = signal<AccountsDto[]>([])
  depositDetail = signal<MyDepositsDto | undefined>({} as MyDepositsDto)
  title = computed(() => `Списание № ${this.docNum()} от ${this.docDate()}`);
  closeTitle = computed(() => `Заявка на досрочное расторжение от ${this.docDate()}`);

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
      title: 'Списание депозита',
      link: '/'
    },
  ];
  paymentDescription = signal('')
  receiverAccountTouched = signal(false);
  signForm: FormGroup = new FormGroup({
    transactionMode: new FormControl('DEPOSIT_WITHDRAW'),
    windowType: new FormControl('BETWEEN_ACCOUNTS'),
    saldo: new FormGroup({
      amount: new FormControl('', Validators.required),
      scale: new FormControl(2),
      currency: new FormControl('UZS'),
    }),
    docNum: new FormControl(),
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
    description: new FormControl(this.paymentDescription()),
  });
  private utilsService = inject(UtilsService)
  private _activatedRoute = inject(ActivatedRoute)
  private _depositService = inject(DepositService)
  private _accountsPaymentsService = inject(AccountsPaymentsService)
  private _userService = inject(UserService)
  private paymentService = inject(PaymentService)
  destroyRef  = inject(DestroyRef)
  private _rightBarService = inject(RightBarService)
  public amountService = inject(AmountService);
  private toastrService = inject(ToastrService);
  private router = inject(Router);
  private espConfirmService = inject(EspSignConfirmService);

  ngOnInit(): void {
    this.watchRoute();
    this.watchQueryRoute();
  }

  watchRoute() {
    this._activatedRoute.params.subscribe(params => {
      if (params){
        this.depositId.set(params['id'])
        this.signForm.patchValue({
          sender:{
            account:params['attachedAccount']
          }
        })
        this.getDepositInfo()
        this.getAccountsList()
        this.getBusinessUserInfo()
        this.getDocNum()
        this.getOperationDay()
      }
    });
  }

  watchQueryRoute() {
    this._activatedRoute.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const isClose = params['isClose'];
        if(isClose) {
          this.isClose = true;
          this.navs[2].title = 'Досрочное расторжение';
          this.removeSaldoAmountValidity();
        }
      })
  }

  removeSaldoAmountValidity() {
    const saldoAmountControl = this.signForm.get('saldo.amount');
    if (saldoAmountControl) {
      saldoAmountControl.clearValidators(); // Remove all validators
      saldoAmountControl.updateValueAndValidity(); // Update validity
    }
  }

  getDepositInfo() {
    // this._depositService.getMyDeposits()
    //   .pipe(takeUntilDestroyed(this.destroyRef))
    //   .subscribe({
    //     next: (res) => {
    //       if (res) {
    //         this.depositDetail.set(res.find(el => el.savDepId === Number(this.depositId())))
    //       }
    //     }
    //   })
  }
  getBusinessUserInfo() {
    this._userService.userInfo$$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.businessUser.set(res?.business)
      });
  }
  convertAmountIntoWords() {
    const saldoRawValue = this.signForm.get('saldo')?.getRawValue();
    const amount = saldoRawValue?.amount;
    if(amount) {
      this.amountInWords.set( this.amountService.numberToWordsRU(amount))
    } else {
      this.amountInWords.set('')
    }
  }

  getAccountsList() {
    this._accountsPaymentsService.getPaymentAllowed({page: 0, size: 100}, {
      senderAccount: null,
      transactionMode: 'DEPOSIT_WITHDRAW'
    }).subscribe(res => {
      if (!res) return;
      this.accounts.set(res.content)
    })
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
  displayOption(option: any){
    if(option) {
      return `${option.code} - ${option.name}`;
    }
    return '';
  }

  scrollPurpose() {
    if(this.purposes().length < this.purposeSize()) {
      return;
    }
    this.purposePage.set(+1);
    this.getPurposes();
  }

  searchPurpose(searchText : string) {
    this.searchPurposeText.set(searchText)
    this.purposePage.set(0)
    this.getPurposes();
  }
  setRecipientAccount(event:AccountsDto){
 this.signForm.patchValue({
   recipient:{
     account:event.altAcctId
   }
 })
  }
  getPurposes() {
    let purposeType: PurposeTypes = PurposeTypes.PAYMENT_CURRENCY;
    // if(this.selectedAccount?.balance?.currency === 'UZS') {
    //   purposeType = PurposeTypes.PAYMENT_UZS;
    // }
    this.paymentService.getPurposes(
      {
        page: this.purposePage(),
        size: this.purposeSize(),
        searchText: this.searchPurposeText(),
      },
      purposeType
    ).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ((res) => {
          const content = res?.content
          if(content && Array.isArray(content)) {

            this.purposePage.set(res.number)
            if(this.purposePage() === 0) {
              this.purposes.set(content)
            } else {
              this.purposes.set([...this.purposes(), ...content])
            }
          }
        }),

      })
  }
  checkTouchedReceiver() {
    const account = this.signForm.get('recipient')?.get('account') as FormControl
    this.receiverAccountTouched.set(Boolean(account.invalid && account.touched))
  }

  submit(type = 'SAVE') {
    this.signForm.markAllAsTouched();
    this.checkTouchedReceiver();
    if(this.signForm.valid) {
      this.checkPaymentAllowed(type);
    }
  }
  selectAction(event: any) {
    if (event.value == 'create') {
      this.submit();
    }
  }
  checkPaymentAllowed(type = 'SAVE') {
    const form = this.signForm.getRawValue();
    const data = {
      senderAccount: null,
      recipientAccount: form.recipient.account,
      transactionMode: this.signForm.value.transactionMode
    }
    this._accountsPaymentsService.checkPaymentAllowed(data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(val => {
        if(val) {
          if(type == 'EDIT') {
            // if(this.toQuery === 'edit-template') {
            //   this.editTemplate();
            // } else {
            //   this.editTransaction();
            // }
          } else {
            if(this.isClose) {
              this.closeDeposit(type);
            } else {
              this.withdraw(type);
            }
          }
        }
      })
  }

  signPayment(id: string) {
    this.espConfirmService.paymentSign({
      type: 'DEPOSIT_WITHDRAW',
      id,
      hash: ''
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
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

  closeDeposit(type = 'SAVE') {
    const body = {
      docNum: this.docNum(),
      docDate: this.docDate(),
      codeFilial: this.depositDetail()?.codeFilial,
      account: this.signForm.getRawValue().recipient.account,
      contractId: this.depositId(),
      summa: this.depositDetail()?.amount,
    }
    this._depositService.closeDeposit(body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          if(!res) return;
          if(type === 'SEND') {
            this.signApplication(res.id);
          } else {
            this.toastrService.success('Успешно!');
            this.router.navigate(['/applications']);
          }
        },
        error: (err) => {
          const message = err.message || err || 'Что-то пошло не так!';
          this.toastrService.error(message);
        }
      })
  }

  signApplication(id: string) {
    this.espConfirmService.signApplication({
      transactionId: null,
      applicationId: id,
    }).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if(!res) return;
          this.toastrService.success('Успешно!');
          this.router.navigate(['/applications']);
        },
        error: (err) => {
          const message = err.message || err || 'Что-то пошло не так!';
          this.toastrService.error(message);
        }
      })
  }

  withdraw(type = 'SAVE') {
    const body: WithdrawRequest = {
      docNum: this.docNum(),
      docDate: this.docDate(),
      amount: +this.signForm.getRawValue().saldo.amount * 100,
      accountNumber: this.signForm.getRawValue().recipient.account,
      arrangementId: this.depositId(),
      currency: `${this.depositDetail()?.currency}`,
      depositAccount: `${this.depositDetail()?.account}`,
    }
    this._depositService.prepareWithdraw(body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if(!res) return;
          if(type === 'SEND') {
            this.signPayment(res.id);
          }
          else {
            this.toastrService.success('Успешно!');
            this.router.navigate(['/accounts-and-payments'], {
              queryParams: {
                tab: 'payments',
              }
            });
          }
        },
        error: (err) => {
          const message = err.message || err || 'Что-то пошло не так!';
          this.toastrService.error(message);
        }
      })
  }

  createTransaction(type = 'SAVE') {
    let t = type;
    let fromQuery = '';
    if(type === 'templates') {
      fromQuery = type;
      t = 'SAVE';
    }
    const body = this.signForm.getRawValue();
    body.sender.account = this.signForm.getRawValue().sender.account
    body.saldo.amount = Math.round(this.signForm.getRawValue().saldo.amount * 100);
    delete body.purpose.purposeType;
    body.purpose.code = body.purpose.code.trim();
    this.utilsService.spinnerState$$.next(true);
    this.paymentService.createTransaction(body, t, fromQuery);
  }
}
