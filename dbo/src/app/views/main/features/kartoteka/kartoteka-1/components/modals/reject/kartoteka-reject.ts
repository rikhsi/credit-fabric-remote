import { ChangeDetectionStrategy, Component, inject, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef, MatDialogModule, MatDialog } from "@angular/material/dialog";
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { NgClass, NgIf } from "@angular/common";
import { NgxMaskPipe, NgxMaskDirective } from "ngx-mask";
import { TranslateModule } from "@ngx-translate/core";
import { KartotekaOne } from "../../../../models/kartoteka.model";
import { Kartoteka2Store } from "../../../../store/kartoteka2.store";
import { maskNumber } from "src/app/core/utils/global-filter.util";
import { KartotekaESPModalComponent } from '../../sign-esp-modal/sign-modal';

@Component({
  selector: 'reject-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatDialogClose,
    TranslateModule,
    NgIf,
    NgClass,
    NgxMaskPipe,
    NgxMaskDirective,
    ReactiveFormsModule
  ],
  templateUrl: './kartoteka-reject.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Kartoteka1RejectDialogComponent {
  private dialogRef = inject(MatDialogRef<Kartoteka1RejectDialogComponent>);
  protected kartoteka2Store = inject(Kartoteka2Store);
  private dialog = inject(MatDialog);




  signForm = new FormGroup({
    description: new FormControl("", [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(450)
    ]),
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: { card: KartotekaOne }) {}

  closeDialog(): void {
    this.dialogRef.close();
  }


  onReject(): void {
    if (this.signForm.valid) {
      const formValues = this.signForm.getRawValue();
     const payload = {
      type: "REJECT",
      body: {
          cardId: this.data.card.documentId,
          acceptedSum: 0,
          rejectedSum: this.data.card.sumDoc,
          rejectedDocNum: this.data.card.docNum,
          rejectedDocDate: this.formatDDMMYYYY(new Date()) ,
          reason: formValues.description
        }
    };

      this.dialogRef.close();


      this.dialogRef.afterClosed().subscribe(() => {
        this.dialog.open(KartotekaESPModalComponent, {
          data: payload,
          width: '548px',
        });
      });
    } else {
      this.signForm.markAllAsTouched();
    }
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

  protected readonly Math = Math;
  protected maskNumber = maskNumber;
}
