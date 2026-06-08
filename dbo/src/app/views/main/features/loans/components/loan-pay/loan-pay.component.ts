import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit } from '@angular/core';
import { WidgetsComponent } from '../../../../../../shared/components/widgets/widgets.component';
import { ContainerTitleComponent } from '../../../../../../shared/components/container-title/container-title.component';
import { ContainerNavComponent } from '../../../../../../shared/components/container-nav/container-nav.component';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoanService } from '../../services/loan.service';
import { LoanInfoComponent } from '../loan-info/loan-info.component';
import { LoanDetail, LoanTypes, PreparePaymentRequest } from '../../models/loan.model';
import { AccountsPaymentsService } from '../../../accounts-payments/services/accounts-payments.service';
import { AccountsDto } from '../../../accounts-payments/models/accounts-payments.model';
import { AccountSelectComponent } from '../../../../../../shared/components/account-select/account-select.component';
import { MatAccordion, MatExpansionPanel } from '@angular/material/expansion';
import { UserService } from '../../../../../../core/services/user.service';
import { NgClass, NgIf, NgOptimizedImage } from '@angular/common';
import { MatError, MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { NgxMaskDirective } from 'ngx-mask';
import { MoreActionsComponent } from '../../../new-payment/components/more-actions/more-actions.component';
import { UtilsService } from '../../../../../../core/services/utils.service';
import { PaymentService } from '../../../../../../core/services/payment.service';
import { ToastrService } from 'ngx-toastr';
import { EspSignConfirmService } from '../../../../../../core/services/esp-confirm.service';
import { LocationBackDirective } from '../../../../../../shared/directives/location-back.directive';

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
        MatSuffix,
        LocationBackDirective
    ],
    templateUrl: './loan-pay.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoanPayComponent implements OnInit {
  title = 'Погашение кредита';
  navs = [
    {
      title: 'Главная',
      link: '/'
    },
    {
      title: 'Мои кредиты',
      link: '/loans/loans-my'
    },
    {
      title: this.title,
      link: '/'
    },
  ];
  docDate!: Date;
  loanId = '';
  loanDetail!: LoanDetail;

  editPayment!: any;
  preSelectedAccount!: AccountsDto;

  accounts!: AccountsDto[];
  selectedReceiverAccount!: AccountsDto;
  receiverAccounts!: any;
  receiverAccountTouched = false;
  senderAccountTouched = false;
  isOpenRequisites = false;
  businessUser!: any;
  isEditing = false;
  docNum = '';
  changedDocNum = '';

  docNumReceived = false;

  paymentType = [
    {
      type: LoanTypes.MAIN,
      title: 'Погашения основного долга',
    },
    {
      type: LoanTypes.PERCENTAGE,
      title: 'Погашения начисленных процентов',
    },
  ];

  repaymentForm = this.fb.nonNullable.group({
    docNum: [''],
    docDate: [''],
    amount: [null as unknown as number, Validators.required],
    senderAccount:  ['', Validators.required],
    receiverAccount: ['', Validators.required],
    loanId: ['', Validators.required],
    type: [this.paymentType[0].type, Validators.required],
    description: [''],
  });

  constructor(
    private _cdRef: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    private destroyRef: DestroyRef,
    private loanService: LoanService,
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
    this.watchEdit();
    this.initLoanId();
    this.getAccountsList();
    this.getDocNum();
    this.getBusinessUserInfo();
  }

  setDocNum(event: Event) {
    this.changedDocNum = (event.target as HTMLInputElement).value;
  }

  watchEdit() {
    this.activatedRoute.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        if(params['edit'] === 'true') {
          const data = sessionStorage.getItem('edit-payment');
          if(data) {
            this.editPayment = JSON.parse(data);
            this.updateEditForm();
          }
        }
      });
  }

  updateEditForm() {
    this.docNum = this.editPayment.docNum;
    this.changedDocNum = this.docNum;
    this.docNumReceived = true;

    this.repaymentForm.patchValue({
      amount: +this.editPayment.senderAmount.amount / 100,
      description: this.editPayment.description,
    })
  }

  getDocDate() {
    let date: Date = new Date();
    if(this.docDate) {
      date = new Date(this.docDate);
    }
    this._cdRef.markForCheck();
    return date?.toLocaleDateString('ru-Ru')
  }


  setSenderAccount(acc: AccountsDto) {
    this.repaymentForm.patchValue({
      senderAccount: acc.altAcctId,
    });
    this.senderAccountTouched = false;
  }

  setReceiverAccount(acc: AccountsDto) {
    this.repaymentForm.patchValue({
      receiverAccount: acc.altAcctId,
    });
    this.receiverAccountTouched = false;
  }

  initLoanId() {
    this.activatedRoute.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const loanId = res.get('loanId');
          if(loanId) {
            this.loanId = `${loanId}`;
          }
          this.getReceiverAccountList(LoanTypes.MAIN);
        }
      })
  }

  getAccountsList() {
    this.accountsPaymentsService.getPaymentAllowed({page: 0, size: 100}, {
      senderAccount: null,
      transactionMode: 'LOAN_REPAYMENT'
    }).subscribe(res => {
      if (!res) return;
      this.accounts = res.content;
      const acc = this.accounts.find(a => a.altAcctId === this.editPayment?.sender?.account);
      if(acc) {
        this.setSenderAccount(acc);
        this.preSelectedAccount = acc;
      }
    });
  }

  getReceiverAccountList(type: LoanTypes) {
    this.accountsPaymentsService.getLoanAccountsAllowed(this.loanId, type)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if(!res || !(res?.length > 0)) return;
          this.receiverAccounts = res;
          this.selectedReceiverAccount = res[0];
          this.repaymentForm.patchValue({
            receiverAccount: this.selectedReceiverAccount.altAcctId,
          })
        }
      });
  }

  selectAction(event: any) {
    if(event.value == 'create') {
      this.submit();
    }
  }
  checkTouchedSender() {
    this.receiverAccountTouched = Boolean(this.repaymentForm.get('senderAccount')?.invalid && this.repaymentForm.get('senderAccount')?.touched);
  }

  submit(t = 'SAVE') {
    this.repaymentForm.markAllAsTouched();
    this.checkTouchedSender();
    if(this.repaymentForm.invalid) return;
    const payload = {
      ...this.repaymentForm.getRawValue(),
      amount: this.repaymentForm.controls.amount.value * 100,
      type: 'LOAN_REPAYMENT',
      docNum: this.docNum,
    } as PreparePaymentRequest;

    if(t === 'EDIT') {
      this.edit(payload);
    } else {
      this.pay(payload, t);
    }

    this.utilsService.spinnerState$$.next(true);

  }

  edit(payload: PreparePaymentRequest) {
    this.paymentService.deletePreparedTransaction(this.editPayment.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if(!res) return;
          this.pay(payload);
        }
      });
  }

  pay(payload: PreparePaymentRequest, type = 'SAVE') {
    this.loanService.preparePayment(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          if(!res) return;
          if(type === 'SAVE') {
            this.router.navigate(['/accounts-and-payments'], {
              queryParams: {
                tab: 'payments'
              }
            });
          } else if(type === 'SEND') {
            this.send(res.result?.data?.id);
          }

        },
        error: (err: any) => {
          this.toastrService.error(err || err.message || 'Что-то пошло не так!');
          this.utilsService.spinnerState$$.next(false);
          this._cdRef.markForCheck();
        }
      });
  }

  send(id: string) {
    this.utilsService.spinnerState$$.next(true);
    this.espConfirmService.paymentSign({
      type: 'LOAN_REPAYMENT',
      id,
      hash: ''
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        if(res) {
          this._cdRef.detectChanges();
          this.toastrService.success('Успешно!');
        }
      },
      error: (err: any) => {
        this._cdRef.detectChanges();
        const message = err.message || err || 'Неизвестная ошибка!';
        this.toastrService.error(message);
      }
    });
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

  saveDocNum() {
    this.docNum = this.changedDocNum;
    this.toggleEditMode();
    this._cdRef.markForCheck();
  }

  toggleEditMode() {
    this.isEditing = !this.isEditing;
    if(this.isEditing) {
      this.changedDocNum = this.docNum;
    } else {
      this.changedDocNum = '';
    }
  }

  getDocNum() {
    this.paymentService.getPaymentDocNum()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(val => {
        if(val) {
          if(!this.docNumReceived) {
            this.docNum = val.msg;
            this.repaymentForm.patchValue({
              docNum: val.msg
            });
          }
        }
      });
  }

  setDocDate(date: any) {
    this.docDate = date;
    this.repaymentForm.patchValue({
      docDate: date.toISOString(),
    })
    this._cdRef.markForCheck();
  }
}
