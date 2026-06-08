import {ChangeDetectionStrategy, Component, inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogClose} from "@angular/material/dialog";
import {DailyTransaction} from "../../../accounts-payments/models/accounts-payments.model";
import {NgxMaskPipe} from "ngx-mask";

@Component({
  selector: 'app-widgets',
  imports: [
    NgxMaskPipe,
    MatDialogClose
  ],
  templateUrl: './widgets.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WidgetsComponent  {
  data: { dailyTransaction: DailyTransaction, courses: any[] } = inject(MAT_DIALOG_DATA)
}
