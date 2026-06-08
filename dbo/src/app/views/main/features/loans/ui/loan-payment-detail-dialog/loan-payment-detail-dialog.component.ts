import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialogClose } from "@angular/material/dialog";
import { MatDivider } from "@angular/material/divider";
import { NgOptimizedImage } from "@angular/common";
import { NgxMaskPipe } from "ngx-mask";

@Component({
  selector: 'app-loan-payment-detail-dialog',
  imports: [
    MatDialogClose,
    MatDivider,
    NgOptimizedImage,
    NgxMaskPipe
  ],
  templateUrl: './loan-payment-detail-dialog.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoanPaymentDetailDialogComponent {

  protected readonly Number = Number;
}
