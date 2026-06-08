import { ChangeDetectionStrategy, Component, inject, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef, MatDialogModule, MatDialog } from "@angular/material/dialog";
import { NgIf } from "@angular/common";
import { NgxMaskPipe, NgxMaskDirective } from "ngx-mask";
import { TranslateModule } from "@ngx-translate/core";
import { KartotekaOne } from "../../../../models/kartoteka.model";
import { Kartoteka2Store } from "../../../../store/kartoteka2.store";
import { maskNumber } from "src/app/core/utils/global-filter.util";
import { KartotekaESPModalComponent } from "../../sign-esp-modal/sign-modal";
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {AccountsPaymentsService} from "../../../../../accounts-payments/services/accounts-payments.service";
import {
  SuccessMunisModalComponent
} from "../../../../../../../../shared/components/success-munis-modal/success-munis-modal.component";

@Component({
  selector: 'pay-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatDialogClose,
    TranslateModule,
    NgIf,
    NgxMaskPipe,
    NgxMaskDirective
  ],
  templateUrl: './kartoteka-pay.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})


export class Kartoteka1PayDialogComponent {
  private dialogRef = inject(MatDialogRef<Kartoteka1PayDialogComponent>);
  private dialog = inject(MatDialog);
  protected kartoteka2Store = inject(Kartoteka2Store);
  private accountTransaction = inject(AccountsPaymentsService)

  constructor(@Inject(MAT_DIALOG_DATA) public data: { card: KartotekaOne }) {}

   signForm: FormGroup = new FormGroup({
    balance: new FormGroup({
      amount: new FormControl(null, [Validators.required, Validators.min(0.01)]),
      scale: new FormControl(2),
      currency: new FormControl('UZS'),
    }),
    description: new FormControl("", [Validators.required, Validators.maxLength(450)]),
  })

  closeDialog(): void {
    this.dialogRef.close();
  }

  confirmPayment(): void {
    console.log(this.data, "val");
    this.accountTransaction.paymentKartotekaFull({
      id: null,
      cardId: this.data.card.documentId,
      clAcc: this.data.card.clAcc.accountNumber,
      coAcc: this.data.card.coAcc.accountNumber,
      coInn: this.data.card.coInn,
      coMfo: this.data.card.coMfo,
      coName: this.data.card.coName,
      docNum: this.data.card.docNum,
      docDate: this.formatDDMMYYYY(new Date()),
      restSum: this.data.card.sumSaldo,
      purposeCode: this.data.card.purposeCode,
      purposeName: this.data.card.purposeName,
      sumLimit: this.data.card.sumSaldo,
    }).pipe().subscribe({
      next: ((result: any) => {
        this.closeDialog()
        console.log(result, "res")
        this.dialog.open(SuccessMunisModalComponent, {
          data: {
            amount: this.data.card.sumSaldo,
            transactionId: result.id,
            data: {
              transactionMode: "KARTOTEKA",
            },
          },
          disableClose: true,
        }).afterClosed()
          .subscribe((res: any) => {
            // if (res === 'agree') {
            //   this.utilsService.spinnerState$$.next(true);
            //   this.submit()
            // }
          });
      })
    })
    // const formValues = this.signForm.getRawValue();
    // const payload = {
    //   type: "ACCEPT",
    //   body: {
    //       cardId: this.data.card.documentId,
    //       acceptedSum: this.data.card.sumDoc,
    //       rejectedSum: 0,
    //       rejectedDocNum: this.data.card.docNum,
    //       rejectedDocDate: this.formatDDMMYYYY(new Date()) ,
    //       reason: formValues.description
    //     }
    //
    // };
    //
    //
    // this.dialogRef.close();
    //
    //
    // this.dialogRef.afterClosed().subscribe(() => {
    //   this.dialog.open(KartotekaESPModalComponent, {
    //     data: payload,
    //     width: '548px',
    //   });
    // });
  }

  protected getSelectedStatus(status: string) {
    return this.kartoteka2Store.statusListToMap().find(res => res.value === status) || null;
  }

  parseNumber(value: any): number {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;

    const normalized = value.toString().replace(/\s/g, '').replace(',', '.');
    return parseFloat(normalized) || 0;
  }


  formatDDMMYYYY(date:any) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();

  return `${dd}.${mm}.${yyyy}`;
}
  formatMoney(value: number) {
    const amount = (value / 100).toFixed(2);
    const [integer, decimal] = amount.split('.');

    const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

    return `${formattedInteger}.${decimal}`;
  }
  protected readonly Math = Math;
  protected maskNumber = maskNumber;
}
