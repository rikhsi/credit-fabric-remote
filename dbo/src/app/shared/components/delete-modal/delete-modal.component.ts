import { ChangeDetectionStrategy, Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatRipple } from '@angular/material/core';
import {TranslateModule} from "@ngx-translate/core";
import { SvgIconComponent } from '../svg-icon/svg-icon.component';

@Component({
  selector: 'app-agree-modal',
  imports: [
    MatDialogClose,
    MatIcon,
    MatRipple,
    TranslateModule,
    SvgIconComponent
  ],
  templateUrl: './delete-modal.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeleteModalComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { title: string, agree: string, cancel: string},
    private matDialogRef: MatDialogRef<DeleteModalComponent>
  ) {
  }

  onAgree() {
    this.matDialogRef.close('agree');
  }
}
