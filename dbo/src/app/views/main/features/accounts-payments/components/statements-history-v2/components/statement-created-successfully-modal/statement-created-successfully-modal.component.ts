import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { SvgIconComponent } from 'src/app/shared/components/svg-icon/svg-icon.component';

@Component({
  selector: 'app-statement-created-successfully-modal',
  imports: [MatIconModule, SvgIconComponent],
  templateUrl: './statement-created-successfully-modal.component.html',
  styleUrls: ['./statement-created-successfully-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatementCreatedSuccessfullyModalComponent {
  constructor(
    public _matDialog: MatDialog,
    protected _matDialogRef: MatDialogRef<StatementCreatedSuccessfullyModalComponent>,
  ) {

  }


}