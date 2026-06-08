// Angular
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { RouterLink } from "@angular/router";
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef } from "@angular/material/dialog";


// Service
import { CorpCardService } from '../../../../services/corp-card.service';


@Component({
  selector: 'remove-limit',
  imports: [
    MatDialogClose,
    RouterLink,
    NgIf,
    TranslateModule
  ],
  templateUrl: './remove.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})


export class RemoveLimitDialogComponent {
  protected corpCardService = inject(CorpCardService)
  private toastrService = inject(ToastrService)
  readonly data: any = inject(MAT_DIALOG_DATA)

  constructor(
    private dialogRef: MatDialogRef<RemoveLimitDialogComponent>,
  ) { }



  closeDialog(): void {
    this.dialogRef.close();
  }

 
  removeLimit(): void {
    if (!this.data.cardId) return;
    this.corpCardService.removeLimit({ uuid:this.data?.cardId, limitId:40})
      .subscribe({
        next: (res) => {
          if (res) {
            this.toastrService.success(res?.msg);
            this.dialogRef.close("success");
          }
        },
        error: () => {
           this.dialogRef.close("error");
        }
      });
  }
  
}


