import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-preparing-your-statement-modal',
  imports: [MatIconModule],
  templateUrl: './preparing-your-statement-modal.component.html',
  styleUrls: ['./preparing-your-statement-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreparingYourStatementModalComponent {
  constructor(
    public _matDialog: MatDialog,
    protected _matDialogRef: MatDialogRef<PreparingYourStatementModalComponent>,
  ) {

  }

}
