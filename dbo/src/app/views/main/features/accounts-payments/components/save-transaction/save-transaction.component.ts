import { ChangeDetectionStrategy, Component, DestroyRef, EventEmitter, Inject, Output } from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatIcon} from "@angular/material/icon";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {NgClass, NgIf} from "@angular/common";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {UtilsService} from "../../../../../../core/services/utils.service";
import {AccountsPaymentsService} from "../../services/accounts-payments.service";
import {ToastrService} from "ngx-toastr";
import { pipe } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {TranslateModule} from "@ngx-translate/core";

@Component({
    selector: 'app-save-transaction',
  imports: [
    FormsModule,
    MatIcon,
    MatProgressSpinner,
    ReactiveFormsModule,
    NgClass,
    NgIf,
    TranslateModule
  ],
    templateUrl: './save-transaction.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SaveTransactionComponent {
  templateForm:FormGroup = new FormGroup({
    transactionId:new FormControl('',Validators.required),
    name:new FormControl('',Validators.required)
  })
constructor(
  public dialog:MatDialogRef<SaveTransactionComponent>,
  @Inject(MAT_DIALOG_DATA) public data:string,
  private _utilsService:UtilsService,
  private accountPaymentService:AccountsPaymentsService,
  private toast:ToastrService,
  private destroyRef: DestroyRef,
) {

  if (this.data){
    this.templateForm.patchValue({
      transactionId:this.data
    })
  }
}

  @Output() save = new EventEmitter<void>()

  formSubmit(){
    if (this.templateForm.valid){
      this._utilsService.spinnerState$$.next(true);
      this.accountPaymentService.saveTransaction(this.templateForm.value)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (res)=>{
            if (!res) return
            this.toast.success(res.msg);
            this.save.emit();
          },
          error: (err) => {
            this.toast.error(err.message);
            this._utilsService.spinnerState$$.next(false);
          },
          complete: () => {
            this._utilsService.spinnerState$$.next(false);
            this.dialog.close('update');
          }
        })
    }
  }
}
