
// Angular
import { NgIf } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { RouterLink } from "@angular/router";
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef } from "@angular/material/dialog";


// Service
import { PayrollProjectResponseContent } from '../../../../payroll-project/models/payroll-project.type';
import { CorpCardService } from '../../../services/corp-card.service';

import { TranslateModule, TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'Block-card',
  imports: [
    MatDialogClose,
    RouterLink,
    NgIf,
    TranslateModule
  ],
  templateUrl: './block-card.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlockCardDialogComponent {
  protected corpCardService = inject(CorpCardService)
  readonly card: PayrollProjectResponseContent = inject(MAT_DIALOG_DATA)
  protected translate = inject(TranslateService);

  constructor(
    private toastrService: ToastrService,
    private dialogRef: MatDialogRef<BlockCardDialogComponent>,
  ) { }



  closeDialog(): void {
    this.dialogRef.close();
  }


  confirm(): void {
    const action = this.card?.status === 'ACTIVE' ? 'block' : 'unblock';
    this.handleCardAction(action);
  }

  private handleCardAction(action: 'block' | 'unblock'): void {
    const t = this.translate.instant.bind(this.translate);
    if (!this.card?.uuid) return;

    const apiCall =
      action === 'block'
        ? this.corpCardService.blockCard({ id: this.card.uuid })
        : this.corpCardService.unBlockCard({ id: this.card.uuid });

    apiCall.subscribe({
      next: (res: any) => {
        this.toastrService.success(res.msg);
        this.dialogRef.close('success');
      },
      error: (err) => {
        this.toastrService.error(err);
        this.dialogRef.close(err);
      },
    });
  }
}
