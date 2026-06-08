import {ChangeDetectionStrategy, Component, EventEmitter, Inject, Output} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {DialogRef} from "@angular/cdk/dialog";
import {MatDivider} from "@angular/material/divider";
import {MatFormField} from "@angular/material/form-field";
import {MatIcon} from "@angular/material/icon";
import {MatInput} from "@angular/material/input";
import {MatOption} from "@angular/material/autocomplete";
import {MatSelect} from "@angular/material/select";
import {NgxMaskDirective} from "ngx-mask";
import {ReactiveFormsModule} from "@angular/forms";
import {UiOtpInputComponent} from "../../../../../../core/components/ui-otp-input/ui-otp-input.component";
import {AccountsPaymentsService} from "../../services/accounts-payments.service";
import {Subject, takeUntil} from "rxjs";
import {NgClass} from "@angular/common";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {ToastrService} from "ngx-toastr";
import {CorpCardService} from "../../../corp-cards/services/corp-card.service";
import {data} from "autoprefixer";

@Component({
    selector: 'app-transaction-confirm-dialog',
    imports: [
        MatDivider,
        MatFormField,
        MatIcon,
        MatInput,
        MatOption,
        MatSelect,
        NgxMaskDirective,
        ReactiveFormsModule,
        UiOtpInputComponent,
        NgClass,
        MatProgressSpinner
    ],
    templateUrl: './transaction-confirm-dialog.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionConfirmDialogComponent {
  @Output() confirm = new EventEmitter<void>()
  private unsub$ = new Subject<void>();
  public isOtpIncorrect = false;
  public isLoading = false;
  otpCode = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {externalId:string ; type:string},
    public dialogRef: DialogRef<TransactionConfirmDialogComponent>,
    private _accountsPaymentsService: AccountsPaymentsService,
    private _toastr: ToastrService,
    private _corpCardService:CorpCardService
  ) {
  }

  public handleOtp(otp: string): void {
    if (otp.length === 5 && this.data.type === 'PAYMENT') {
      this.otpCode = otp
    }
    else if (otp.length === 6 && this.data.type === 'ACTIVATE_CORP_CARD'){
      this.otpCode = otp
    }
  }

  formSubmit() {
    this.isLoading = true
    if (this.otpCode.length === 5 && this.data && this.data.type === 'PAYMENT') {
      this._accountsPaymentsService.confirmTransaction(this.otpCode, this.data.externalId).pipe(takeUntil(this.unsub$)).subscribe({
        next: (res: any) => {
          if (res.success) {
            this._toastr.success(res.result.data.message)
          }
        },
        complete: () => {
          this.isLoading = false
          this.dialogRef.close()
        }
      })
    }
    else if (this.otpCode.length === 6 && this.data && this.data.type === 'ACTIVATE_CORP_CARD') {
      this._corpCardService.confirmCard(this.otpCode, this.data.externalId).pipe(takeUntil(this.unsub$)).subscribe({
        next: (res: any) => {
          if (res) {
            this._toastr.success(res.msg)
            this.confirm.emit()
          }
        },
        complete: () => {
          this.isLoading = false
          this.dialogRef.close()
        }
      })

    }
  }
}
