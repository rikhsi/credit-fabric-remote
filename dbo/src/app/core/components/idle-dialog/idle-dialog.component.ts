import {ChangeDetectionStrategy, Component, EventEmitter, Inject, Output} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ReactiveFormsModule} from "@angular/forms";
import {IdleTimerCircleComponent} from "../idle-timer-circle/idle-timer-circle.component";

@Component({
  selector: 'app-agree-dialog',
  imports: [
    ReactiveFormsModule,
    IdleTimerCircleComponent
  ],
  templateUrl: './idle-dialog.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdleDialogComponent {
  @Output() onAgree = new EventEmitter<string>();

  constructor(
    public _dialogRef: MatDialogRef<IdleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { timeLeft: number }
  ) {
  }

}
