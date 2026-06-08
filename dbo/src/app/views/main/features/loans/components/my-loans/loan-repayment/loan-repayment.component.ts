import { DialogRef } from '@angular/cdk/dialog';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, DestroyRef,
  inject,
  Inject,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { NgxMaskDirective } from 'ngx-mask';
import { UiSvgIconComponent } from 'src/app/core/components/ui-svg-icon/ui-svg-icon.components';
import { TransactionTypes } from 'src/app/core/models/transaction.models';
import { EspSignConfirmService } from 'src/app/core/services/esp-confirm.service';
import { UtilsService } from 'src/app/core/services/utils.service';

import { LoanDto, PreparePaymentRequest } from '../../../models/loan.model';
import { LoanService } from '../../../services/loan.service';
import { LoanStatusIndicatorComponent } from '../loan-status-indicator/loan-status-indicator.component';
import { MatInput } from '@angular/material/input';
import { AccountsDto } from '../../../../accounts-payments/models/accounts-payments.model';
import { AccountsPaymentsService } from '../../../../accounts-payments/services/accounts-payments.service';
import { AccountService } from '../../../../../../../core/services/account.service';
import { AccountSelectComponent } from '../../../../../../../shared/components/account-select/account-select.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { RightBarService } from '../../../../../right-bar/services/right-bar.service';

@Component({
  selector: 'app-loan-repay',
  standalone: true,
  imports: [
    CommonModule,
    UiSvgIconComponent,
    LoanStatusIndicatorComponent,
    MatSelectModule,
    NgxMaskDirective,
    MatIcon,
    ReactiveFormsModule,
    MatInput,
    AccountSelectComponent,
    NgOptimizedImage,
  ],
  templateUrl: './loan-repayment.component.html',
  styles: [
    `
      select {
        -webkit-appearance: none;
        appearance: none;
      }

      .payment-select {
        .mdc-notched-outline__leading,
        .mdc-notched-outline__notch,
        .mdc-notched-outline__trailing {
          border-color: #dbdbdb !important;
        }
        .mdc-text-field--outlined {
          --mdc-outlined-text-field-container-shape: 10px !important;
        }
        .mat-mdc-select-arrow {
          display: none;
        }
        .mat-mdc-form-field-flex {
          height: 44px;
          padding: 8px;
        }
        .mat-mdc-form-field-infix {
          padding-top: 16px;
          top: -15px;
        }
        .mat-mdc-select-placeholder,
        .mat-mdc-form-field-input-control,
        .mat-mdc-select-value-text {
          color: #000;
        }
        .mat-mdc-text-field-wrapper {
          padding: 0;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class LoanRepaymentComponent implements OnInit {
  inputClasses = 'rounded-12px border-1px border-secondary w-full h-11 px-2 outline-none';


  paymentType = [
    {
      type: TransactionTypes.LOAN_REPAYMENT,
      title: 'Погашение',
    },
    {
      type: TransactionTypes.LOAN_PRETERM,
      title: 'Досрочное погашение',
    },
  ];

  repaymentForm = this.fb.nonNullable.group({
    docNum: [''],
    docDate: [''],
    amount: [null as unknown as number, Validators.required],
    senderAccount:  { value: '', disabled: false },
    loanId: [null as unknown as number, Validators.required],
    type: [this.paymentType[0].type, Validators.required],
  });

  private _cdRef = inject(ChangeDetectorRef);
  accounts!: AccountsDto[];

  constructor(
    public dialogRef: DialogRef,
    private matDialog: MatDialog,
    private fb: FormBuilder,
    private utilService: UtilsService,
    private loanService: LoanService,
    private espSignConfirmService: EspSignConfirmService,
    private accountService: AccountService,
    private accountsPaymentService: AccountsPaymentsService,
    private rightBarService: RightBarService,
    @Inject(MAT_DIALOG_DATA) public data: LoanDto,
    private destroyRef: DestroyRef,
    private router: Router,
    private matDialogRef: MatDialogRef<LoanRepaymentComponent>
  ) {}

  ngOnInit(): void {
    this.repaymentForm.patchValue({
      loanId: this.data.loanId,
      senderAccount: this.data.attachedAccount,
      amount: this.data.repaymentAmount.amount / 100
    });
    this.getAccountsList();
    this.getDocNum();
    this.getOperDay();
    this._cdRef.detectChanges();
  }

  setFormFields(account: AccountsDto) {
    this.repaymentForm.patchValue({
      senderAccount: account.altAcctId,
    });
  }

  onSubmit() {
    const payload = {
      ...this.repaymentForm.getRawValue(),
      amount: this.repaymentForm.controls.amount.value * 100,
    };
    const { type } = this.repaymentForm.value;
    this.utilService.spinnerState$$.next(true);

    this.loanService.preparePayment(payload as unknown as PreparePaymentRequest)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
      if(!res) return;
      this.router.navigate(['/accounts-and-payments'], {
        queryParams: {
          tab: 'payments'
        }
      }).then(() => {
        this.matDialogRef.close();
      })
    })
  }

  getAccountsList() {
    this.accountService.getPaymentAllowed(
      {page: 0, size: 100},
      {
              senderAccount: null,
              transactionMode: 'LOAN_REPAYMENT'
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
      if (!res) return;
      this.accounts = res.content;
    })
  }

  togglePayment() {
    const paymentType = this.repaymentForm.value.type;
    if(paymentType === TransactionTypes.LOAN_REPAYMENT) {
      this.repaymentForm.patchValue({
        amount: this.data.repaymentAmount.amount
      });
    } else {
      this.repaymentForm.patchValue({
        amount: 0
      });
    }
  }

  getDocNum() {
    this.accountsPaymentService.getTransactionDocNum()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(val => {
        if(val) {
          this.repaymentForm.patchValue({
            docNum: val.msg
          })
        }
      })
  }

  getOperDay() {
    this.rightBarService.getOperDay()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(val => {
        if(val) {
          this.repaymentForm.patchValue({
            docDate: val?.currentWorkingDate.toString()
          })
        }
      })
  }
}
