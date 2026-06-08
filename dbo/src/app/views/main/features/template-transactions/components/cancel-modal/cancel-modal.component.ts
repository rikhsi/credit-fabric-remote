import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatRipple } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'app-cancel-modal',
  imports: [
    MatDialogClose,
    MatIcon,
    MatRipple,
    MatFormFieldModule,
    FormsModule,
    MatInput,
  ],
  templateUrl: './cancel-modal.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CancelModalComponent implements OnInit {
  name = '';
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { title: string, desc: string},
    private matDialogRef: MatDialogRef<CancelModalComponent>
  ) {
  }

  ngOnInit() {
  }

  onAgree() {
    this.matDialogRef.close('agree');
  }
  onCancel() {
    this.matDialogRef.close('close');
  }
}
