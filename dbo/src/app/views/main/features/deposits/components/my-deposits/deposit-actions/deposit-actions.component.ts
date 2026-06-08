import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, OnDestroy, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatRippleModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { NgxMaskDirective } from 'ngx-mask';
import { mergeMap, of, Subject, takeUntil } from 'rxjs';
import { EspSignConfirmComponent } from 'src/app/core/components/esp-sign-confirm/esp-sign-confirm.component';
import { UiSvgIconComponent } from 'src/app/core/components/ui-svg-icon/ui-svg-icon.components';
import { TransactionTypes } from 'src/app/core/models/transaction.models';

import { DepositDetailsDto } from '../../../models/deposits.model';
import { DepositService } from '../../../services/deposit.service';
import { DepositChequeComponent } from '../deposit-cheque/deposit-cheque.component';

@Component({
  selector: 'app-deposit-actions',
  standalone: true,
  imports: [
    CommonModule,
    UiSvgIconComponent,
    MatSelectModule,
    NgxMaskDirective,
    MatRippleModule,
    FormsModule,
    MatIcon,
    ReactiveFormsModule
  ],
  templateUrl: './deposit-actions.component.html',
  styles: [
    `
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
        .mat-mdc-form-field-icon-suffix {
          width: 40px;
        }
        .mat-mdc-text-field-wrapper {
          padding: 0;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class DepositActionsComponent implements OnDestroy{
  payment_type: string = '1';
  unsub$ = new Subject<void>();
  form = this.fb.nonNullable.group({
    amount: [null as unknown as string, Validators.required],
  });
  constructor(
    private depositService: DepositService,
    private matDialog: MatDialog,
    public dialogRef: MatDialogRef<DepositActionsComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: { title: string, arrangementId: string, deposit: DepositDetailsDto }
  ) {}

  onSuccessAction() {
    this.matDialog.open(DepositChequeComponent)
  }

  onWithdrawDeposit() {
    this.depositService.prepareWithdraw({
      docNum: '',
      docDate: '',
      amount: +this.form.controls.amount.value,
      currency: this.data.deposit.currency,
      accountNumber: this.data.deposit.id,
      arrangementId: this.data.arrangementId,
      depositAccount: ``
    }).pipe(takeUntil(this.unsub$), mergeMap(res => {
      if (!res) return of(null);
      return this.depositService.myDepositPaymentSign({
        id: [res.id],
        hash: null,
        type: TransactionTypes.DEPOSIT_WITHDRAW,
      })
    })).subscribe(res => {
      const type = TransactionTypes.DEPOSIT_WITHDRAW;
      if (!res) return;
      this.matDialog.open(EspSignConfirmComponent, {
        width: '500px',
        data: { action: {...res, type}, transaction: {} }
      })
    })
  }

  onTopUpDeposit() {
    this.depositService.prepareTopUp({
      docNum: '',
      docDate: '',
      amount: +this.form.controls.amount.value * 100,
      currency: this.data.deposit.currency,
      accountNumber: this.data.deposit.id,
      arrangementId: this.data.arrangementId,
      depositAccount: ``,
    }).pipe(takeUntil(this.unsub$), mergeMap(res => {
      if (!res) return of(null);
      return this.depositService.myDepositPaymentSign({
        id: [res.id],
        hash: null,
        type: TransactionTypes.DEPOSIT_TOP_UP,
      })
    })).subscribe(res => {
      const type = TransactionTypes.DEPOSIT_TOP_UP;
      if (!res) return;
      this.matDialog.open(EspSignConfirmComponent, {
        width: '500px',
        data: { action: {...res, type}, transaction: {} }
      })
    })
  }

  copyMessage(event: Event, val: any){
    // console.log(event.target);

    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = val;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }

  ngOnDestroy(): void {
    this.unsub$.next();
    this.unsub$.complete();
  }
}
