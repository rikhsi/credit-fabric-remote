import { ChangeDetectionStrategy, Component, inject, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef, MatDialogModule, MatDialog } from "@angular/material/dialog";
import { NgIf } from "@angular/common";
import { NgxMaskPipe, NgxMaskDirective } from "ngx-mask";
import { TranslateModule } from "@ngx-translate/core";
import { KartotekaOne } from "../../../../models/kartoteka.model";
import { Kartoteka2Store } from "../../../../store/kartoteka2.store";
import { maskNumber } from "src/app/core/utils/global-filter.util";
import { KartotekaESPModalComponent } from "../../sign-esp-modal/sign-modal";

@Component({
  selector: 'move-kartoteka2-dialog',
  standalone: true,
  imports: [
    MatDialogModule, 
    MatDialogClose, 
    TranslateModule, 
    NgIf, 
    NgxMaskPipe, 
    NgxMaskDirective
  ],
  templateUrl: './kartoteka-move.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})


export class Kartoteka1MoveTo2DialogComponent {
  private dialogRef = inject(MatDialogRef<Kartoteka1MoveTo2DialogComponent>);
  private dialog = inject(MatDialog);
  protected kartoteka2Store = inject(Kartoteka2Store);

  constructor(@Inject(MAT_DIALOG_DATA) public data: { card: KartotekaOne }) {}

  closeDialog(): void {
    this.dialogRef.close();
  }

  confirmPayment(): void {
    const payload = {
      type: "MOVE_TO_KARTOTEKA_2",
      body: {
          cardId: this.data.card.documentId,
        }
    };
    
    this.dialogRef.close();

    
    this.dialogRef.afterClosed().subscribe(() => {
      this.dialog.open(KartotekaESPModalComponent, {
        data: payload,
        width: '548px',
      });
    });
  }

  protected getSelectedStatus(status: string) {
    return this.kartoteka2Store.statusListToMap().find(res => res.value === status) || null;
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