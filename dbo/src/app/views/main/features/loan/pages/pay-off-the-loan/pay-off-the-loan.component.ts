import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { animate, style, transition, trigger } from '@angular/animations';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, combineLatest, debounceTime, distinctUntilChanged, EMPTY, filter, finalize, forkJoin, Observable, of, startWith, switchMap, tap } from 'rxjs';

import { AmountService } from '../../../../../../core/services/amount.service';
import { AccountService } from '../../../../../../core/services/account.service';
import { UtilsService } from '../../../../../../core/services/utils.service';
import { ToastrService } from 'ngx-toastr';
import { SpinnerComponent } from '../../../../../../core/components/spinner/spinner.component';
import { AccountsPaymentsService } from '../../../accounts-payments/services/accounts-payments.service';
import { RightBarService } from 'src/app/views/main/right-bar/services/right-bar.service';
import { LoanDetailDto, OneLoanResDto, PrepareLoanTransactionReqDto } from '../../models/loan.modal';
import { MatDialog } from '@angular/material/dialog';
import { PaymentSuccessModalComponent } from 'src/app/shared/components/payment-success-modal/payment-success-modal';
import { LoanService } from '../../../loans/services/loan.service';
import { PaymentService } from 'src/app/core/services/payment.service';
import { TransactionContent } from '../../../accounts-payments/models/accounts-payments.model';


export type RepaymentType = 'EARLY_REPAYMENT' | 'SCHEDULED_REPAYMENT';

export interface RepaymentTypeOption {
  value: RepaymentType;
  label: string;
  description: string;
}

@Component({
  selector: 'app-pay-off-the-loan',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    NgxMaskDirective,
    NgxMaskPipe,
    TranslateModule,
    MatTooltipModule,
    SpinnerComponent,
  ],
  templateUrl: './pay-off-the-loan.component.html',
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
  ],
})
export class PayOffTheLoanComponent implements OnInit {
  @Output() closed = new EventEmitter<void>();

  openSenderAccount = false;
  openRepaymentType = false;

  matDialog = inject(MatDialog)
  private translate = inject(TranslateService);

  mode = signal<'edit' | 'reverse' |null>(null)
  spinnerState = signal<boolean>(false);
  balanceErrorOver = signal<string>('');
  amountInWords = signal<string>('');
  senderAccounts = signal<any>(null);
  choosedSenderAccount = signal<any | null>(null);
  choosedRepaymentType = signal<RepaymentTypeOption | null>(null);
  loanId = signal<any>(null)
  private docNum = '';
  private operDay = '';
  repaymentTypes: RepaymentTypeOption[] = [
    {
      value: 'EARLY_REPAYMENT',
      label: this.translate.instant('new_loan.early_repayment'),
      description: this.translate.instant('new_loan.prepayment_is_an_additional_loan_payment_that_redu'),
  },
    // {
    //   value: 'SCHEDULED_REPAYMENT',
    //   label: 'Плановое погашение',
    //   description: 'Плановый платёж согласно графику погашения кредита.',
    // },
  ];
  descText = signal<string>('');

  payForm = new FormGroup({
    senderAccount: new FormControl('', Validators.required),
    repaymentType: new FormControl<RepaymentType | null>(null, Validators.required),
    amount: new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]),
    description: new FormControl('', [Validators.required, Validators.maxLength(450),this.descIdentityValidator()]),
  });

  businessInfo: any = {};
  loanDetail = signal<LoanDetailDto | null>(null)
  oneLoan = signal<OneLoanResDto | null>(null)
  transactionId= signal<string | null>(null)

  transactionData = signal<TransactionContent | null>(null);
  isIdentical = signal<boolean>(false);


  constructor(
    private accountService: AccountService,
    private amountsService: AmountService,
    private utilsService: UtilsService,
    private toastrService: ToastrService,
    private loanApiService: LoanService,
    private loanService:LoanService,
    private accountsPaymentsService: AccountsPaymentsService,
    private rightBarService: RightBarService,
    private destroyRef: DestroyRef,
    private _cdRef: ChangeDetectorRef,
    protected activatedRoute: ActivatedRoute,
    public router: Router,
    private paymentService:PaymentService,
  ) {}

  ngOnInit(): void {
    this.businessInfo = JSON.parse(localStorage.getItem('businessInfo') as string) ?? {};
    this.choosedRepaymentType.set(this.repaymentTypes[0]);
  this.payForm.patchValue({
      repaymentType: 'EARLY_REPAYMENT'
    });
    this.handleRepaymentTypeChange()

    this.loadInitialData();

    this.payForm.get('description')?.valueChanges.subscribe(() => {
     this.isIdentical.set(false);
   });

  }


    private descIdentityValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return control.value === this.descText()
        ? { identical: true }
        : null;
    };
  }


  private loadInitialData(): void {
    this.spinnerState.set(true);

    combineLatest([
      this.activatedRoute.params,
      this.activatedRoute.queryParams
    ]).pipe(
      tap(([params, query]) => {
        const id = params['id'];
        const mode = query['mode'];

        this.loanId.set(id);
        if (mode == 'edit' || mode == 'reverse') {
          this.transactionId.set(id);
        }
        this.mode.set(mode);
      }),
      switchMap(() => {
        if (this.mode() == null) {
          return this.getOneLoan();
        }
        return of(this.loanId());
      }),
      switchMap(() =>
        forkJoin({
          accounts: this.accountService.getPaymentAllowedLoan(
            this.oneLoan()?.detail?.accCurr
          ),
          docNum: this.accountsPaymentsService.getPaymentTransactionDocNum(),
          operDay: this.rightBarService.getOperDay(),
        })
      ),
      tap(({ accounts, docNum, operDay }) => {
        if (docNum?.msg) {
          this.docNum = docNum.msg;
        }

        if (operDay?.currentWorkingDate) {
          this.operDay = operDay.currentWorkingDate.toString();
        } else {
          const now = new Date();
          const yyyy = now.getFullYear();
          const mm = String(now.getMonth() + 1).padStart(2, '0');
          const dd = String(now.getDate()).padStart(2, '0');
          this.operDay = `${dd}.${mm}.${yyyy}`;
        }

        if (accounts) {
            this.choosedSenderAccount.set(accounts);
            this.payForm.patchValue({ senderAccount: accounts.altAcctId });
        }
        this.spinnerState.set(false);
        this._cdRef.detectChanges();
      }),
      switchMap(() => {
        if (this.mode()) {
          this.spinnerState.set(true);
          return this.paymentService.getTransactionOne(this.transactionId()!).pipe(
            tap(res => this.transactionData.set(res)),
            tap(() => {
              if (this.mode() == 'edit') {
                this.handleEdit();
              } else if (this.mode() == 'reverse') {
                this.handleRepeat();
              }
            }),
            finalize(() => this.spinnerState.set(false))
          );
        } else {
          this.spinnerState.set(false);
          return EMPTY;
        }
      }),
      catchError(() => {
        this.spinnerState.set(false);
        this._cdRef.detectChanges();
        return EMPTY;
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }


private handleRepaymentTypeChange() {
  this.payForm.get('repaymentType')?.valueChanges.pipe(
    startWith(this.payForm.get('repaymentType')?.value),
    takeUntilDestroyed(this.destroyRef),
    distinctUntilChanged(),
    switchMap((repaymentType) => {

      if (repaymentType === 'EARLY_REPAYMENT') {
        return this.getPurposeText();
      }

      this.payForm.patchValue({
        description: ''
      }, { emitEvent: false });

      return EMPTY;
    })

  ).subscribe();
}

  private getOneLoan() {
    return this.loanService.getOneLoan(this.loanId()).pipe(
                        tap((res) => {
                          this.oneLoan.set(res)
                         this.spinnerState.set(false);
                        }),
                        finalize(() => {
                            this.spinnerState.set(false);
                        })
                      )
  }
private handleEdit(): void {

  const tx:TransactionContent | null = this.transactionData();
  if (!tx) return;
  if (tx.additionalInfo?.loanId) {
    this.loanId.set(tx.additionalInfo.loanId);

  }

  const matchedType = this.repaymentTypes.find(
    (t) => t.value === tx.purposeCode || tx.purposeName?.includes('Досрочн')
  ) ?? this.repaymentTypes[0];

  this.choosedRepaymentType.set(matchedType);

  this.payForm.patchValue({
    repaymentType: matchedType.value,
    amount: tx.senderAmount?.amount != null
      ? tx.senderAmount.amount / 100
      : null,
    description: tx.description ?? tx.purposeName ?? '',
  });

  this.getOneLoan().subscribe({
    next:(res)=>{

      if (res?.detail.accCurr){
        this.accountService.getPaymentAllowedLoan(res?.detail.accCurr)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(accounts=>
            this.chooseSenderAccount(accounts))
      }
      // const matchedAccount = this.senderAccounts().find(
      //   (a) => a.altAcctId === tx.sender?.account
      // );
      // if (matchedAccount) {
      //   this.chooseSenderAccount(matchedAccount);
      // }
    }
  })

  this.spinnerState.set(false)
  this.convertAmountIntoWords();
  this._cdRef.detectChanges();
}

private handleRepeat(): void {
  this.transactionId.set(null);
  this.handleEdit();
}


  chooseSenderAccount(account: any): void {
    if (account.status === 'BLOCKED') return;
    this.choosedSenderAccount.set(account);
    this.payForm.patchValue({ senderAccount: account.altAcctId });
    this.openSenderAccount = false;
    this.convertAmountIntoWords();
    this._cdRef.detectChanges();
  }

  chooseRepaymentType(type: RepaymentTypeOption): void {
    this.choosedRepaymentType.set(type);
    this.payForm.patchValue({ repaymentType: type.value });
    this.openRepaymentType = false;
    this._cdRef.detectChanges();
  }

  private getPurposeText():Observable<any> {
   return this.paymentService.getPurposeText('LOAN').pipe(tap((res) => {
          this.payForm.get('description')?.setValue(res.formMessage ||'')
            this.descText.set(res.formMessage || '');

   }))
  }

  convertAmountIntoWords(): void {
    const entered = this.parseNumber(this.payForm.getRawValue().amount ?? 0);
    const senderBalance = this.choosedSenderAccount()?.balance?.amount
      ? this.choosedSenderAccount().balance.amount / 100
      : 0;

    this.balanceErrorOver.set(entered > senderBalance ? this.translate.instant('new_loan.there_are_not_enough_funds_in_the_account') : '');
    this.amountInWords.set(entered ? this.amountsService.numberToWordsRU(entered) : '');
  }

  private parseNumber(value: any): number {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    const normalized = value.toString().replace(/\s/g, '').replace(',', '.');
    return parseFloat(normalized) || 0;
  }

  closePage(): void {
    this.closed.emit();
    const returnUrl = this.activatedRoute.snapshot.queryParamMap.get('returnUrl');
    if (returnUrl) {
      this.router.navigateByUrl(returnUrl);
    } else {
      this.router.navigate(['/loan/main/my']);
    }
  }

  closeOverlay(): void {
    this.openSenderAccount = false;
    this.openRepaymentType = false;
  }

  submit(): void {
    this.isIdentical.set(this.payForm.get('description')?.value === this.descText());
    if (this.payForm.invalid || this.isIdentical()) return;

    this.payForm.markAllAsTouched();
    if (this.payForm.invalid || this.balanceErrorOver().length > 0) return;

    const raw = this.payForm.getRawValue();
    const sender = this.choosedSenderAccount();

    const body: PrepareLoanTransactionReqDto = {
       ...(this.mode() === 'edit' && this.transactionId()
      ? { id: this.transactionId() }
      : {}),
      loanId:this.loanId(),
      description:this.payForm.get('description')?.value || '',
      sender: {
        account: sender?.altAcctId ?? '',
        codeFilial: this.businessInfo?.mainFilial ?? '',
        tax: this.businessInfo?.inn ?? '',
        name: this.businessInfo?.name ?? '',
      },
      recipient: {
        account: this.oneLoan()?.detail.accMain || '-',
        name:this.oneLoan()?.detail.crdTypename || '-',
      },
      purpose: raw.repaymentType!,
      payDate: this.operDay,
      docDate: this.operDay,
      docNum: this.docNum,
      amount: Math.round(this.parseNumber(raw.amount) * 100),
    };
    this.utilsService.spinnerState$$.next(true);

    this.loanApiService.prepareLoanTransaction(body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if(res.result.data == null && res.result.message) {
             this.toastrService.error(res.result.message);
              this.utilsService.spinnerState$$.next(false);
             return;
          }
          this.utilsService.spinnerState$$.next(false);
          if (!res.result.data) return;
          this.paymentService.getTransactionOne(res.result.data?.id)
            .subscribe((transactionOneRes) => {
              const isAutoPay = !(transactionOneRes && transactionOneRes.canUserSign);

this.toastrService.success(this.translate.instant('new_loan.create_a_payment'));

              this.matDialog.open(PaymentSuccessModalComponent, {
                data: {
                  windowType: 'TRANSFER_TO_ACCOUNT',
                  saldo: {
                    amount: body.amount
                  },
                  recipient: {
                    name: this.oneLoan()?.detail.accMain || '-'
                  },
                  transactionId: res.result.data?.id,
                  isAutoPay,
                  ...(isAutoPay && {
                    closeButtonBg: '#00A38D',
                    closeButtonTextColor: '#ffffff'
                  })
                }
              });
            });

          // this.closePage();
        },
        error: (err) => {
          this.utilsService.spinnerState$$.next(false);
          this.toastrService.error(err?.message ?? this.translate.instant('new_loan.something_went_wrong'));
          this._cdRef.detectChanges();
        },
      });
  }





  protected readonly Number = Number;
}
