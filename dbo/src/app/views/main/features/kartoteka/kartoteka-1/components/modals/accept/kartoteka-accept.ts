// Angular
import { NgClass, NgIf } from "@angular/common";
import { NgxMaskPipe, NgxMaskDirective } from "ngx-mask";
import { TranslateModule } from "@ngx-translate/core"
import { ChangeDetectionStrategy, Component, inject, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogClose, MatDialogRef } from "@angular/material/dialog";
import { KartotekaOne } from "../../../../models/kartoteka.model";
import { Kartoteka2Store } from "../../../../store/kartoteka2.store";
import { maskNumber } from "src/app/core/utils/global-filter.util";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { AmountService } from "src/app/core/services/amount.service";
import { ReactiveFormsModule } from "@angular/forms";
import { KartotekaESPModalComponent } from "../../sign-esp-modal/sign-modal";




@Component({
  selector: 'accept-dialog',
  imports: [MatDialogClose, TranslateModule, NgIf, NgxMaskPipe, NgxMaskDirective, NgClass, ReactiveFormsModule],
  templateUrl: './kartoteka-accept.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})



export class Kartoteka1AcceptDialogComponent implements OnInit {
  constructor(
    private dialogRef: MatDialogRef<Kartoteka1AcceptDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { card: KartotekaOne }
  ) { }


  private readonly dialog = inject(MatDialog)

  signForm: FormGroup = new FormGroup({
    balance: new FormGroup({
      amount: new FormControl(null, [Validators.required, Validators.min(0.01)]),
      scale: new FormControl(2),
      currency: new FormControl('UZS'),
    }),
    description: new FormControl("", [Validators.required, Validators.maxLength(450)]),
  })

  amountInWords = '';
  balanceErrorOver = "";


  protected kartoteka2Store = inject(Kartoteka2Store)
  private amountsService = inject(AmountService)



  ngOnInit() {
    // const defaultAmount = this.data.card?.sumDoc ? this.data.card.sumDoc / 100 : 0;
    const defaultAmount = this.data.card?.sumDoc
      ? (this.data.card.sumDoc / 100).toFixed(2)
      : '0.00';
    this.signForm.get('balance.amount')?.setValue(defaultAmount);

    // Boshlang'ichda so'z bilan yozishni chaqirib qo'yamiz
    this.convertAmountIntoWords();

    // Boshlang'ichda izoh shart emas (chunki summa 100%)
    this.updateDescriptionValidation(+defaultAmount, +defaultAmount);

    // Summa o'zgarishini kuzatib boramiz
    this.signForm.get('balance.amount')?.valueChanges.subscribe(() => {
      this.validateAndHandleDescription();
    });
  }


  private validateAndHandleDescription() {
    const entered = this.parseNumber(this.signForm.get('balance.amount')?.value);
    const max = this.parseNumber(this.data.card?.sumDoc ? this.data.card.sumDoc / 100 : 0);

    // 2. Agar summa ko'p bo'lsa yoki 0 bo'lsa mantiq
    if (entered > max || entered <= 0) {
      this.balanceErrorOver = entered > max ? "Сумма превышает допустимую" : "Сумма должна быть больше 0";
      this.signForm.get('balance.amount')?.setErrors({ overMax: true });
    } else {
      this.balanceErrorOver = "";
      this.signForm.get('balance.amount')?.setErrors(null);
    }

    // 3. Dinamik izoh mantiqi (Kamroq bo'lsa shart, 100% bo'lsa shart emas)
    this.updateDescriptionValidation(entered, max);
  }


  private updateDescriptionValidation(entered: number, max: number) {
    const descControl = this.signForm.get('description');
    if (entered < max && entered > 0) {
      descControl?.setValidators([Validators.required, Validators.maxLength(450)]);
    } else {
      descControl?.clearValidators();
      descControl?.setValidators([Validators.maxLength(450)]);
    }
    descControl?.updateValueAndValidity({ emitEvent: false });
  }



  convertAmountIntoWords() {
    const entered = this.parseNumber(this.signForm.get('balance.amount')?.value);
    if (entered > 0) {
      this.amountInWords = this.amountsService.numberToWordsRU(entered);
    } else {
      this.amountInWords = '';
    }
  }





  closeDialog(): void {
    this.dialogRef.close();
  }

  closeAndNavigate() {
    this.closeDialog();
  }


  protected getSelectedStatus(status: string): { name: string; value: string; img: string } | null {
    const selectedStatus = status;
    if (!selectedStatus) return null;
    return this.kartoteka2Store.statusListToMap().find(res => res.value === selectedStatus) || null;
  }


  protected ESPModal(): void {
    const formValues = this.signForm.getRawValue();
    const enteredAmount = this.parseNumber(formValues.balance.amount);
    const totalDocSum = this.data.card.sumDoc || 0;
    const acceptedSumTiyin = Math.round(enteredAmount * 100);
    const rejectedSumTiyin = Math.max(0, totalDocSum - acceptedSumTiyin);



    const payload = {
      type: "ACCEPT",
      body: {
          cardId: this.data.card.documentId,
          acceptedSum: acceptedSumTiyin,
          rejectedSum: rejectedSumTiyin,
          rejectedDocNum: this.data.card.docNum,
          rejectedDocDate: this.formatDDMMYYYY(new Date()),
          reason: formValues.description,
        }

    };


    this.dialogRef.close('updated');


    this.dialog.open(KartotekaESPModalComponent, {
      data: payload,
      width: '548px',
     }).afterClosed().subscribe(result => {
      if (result) {

      }
    });
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




  protected readonly Math = Math;
  protected maskNumber = maskNumber

}




