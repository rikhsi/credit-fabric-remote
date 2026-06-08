import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IconComponent } from '../../../../../../shared/ui/icon/icon.component';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef} from '@angular/material/dialog';
import { MinorToMajorPipe } from '../../../../../../shared/lib/minor-to-major.pipe';
import { TranslateModule } from "@ngx-translate/core";
import {Router} from "@angular/router";
import {PaymentSignModalComponent} from "../../../../../../shared/components/payment-sign-modal/payment-sign-modal";
import {Dialog, DialogRef} from "@angular/cdk/dialog";

@Component({
  selector: 'app-payroll-statement-created-dialog',
  imports: [
    IconComponent,
    MatDialogClose,
    MinorToMajorPipe,
    TranslateModule
  ],
  templateUrl: './payroll-statement-created-dialog.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PayrollStatementCreatedDialogComponent {
  public readonly data = inject<
    { total: number, docNum: string, currency: string }
  >(MAT_DIALOG_DATA);
  public router  = inject(Router);
  public dialogRef = inject(MatDialogRef<PayrollStatementCreatedDialogComponent>);

}
