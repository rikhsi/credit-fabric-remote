import { ChangeDetectionStrategy, Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatRipple } from '@angular/material/core';
import {TranslateModule} from "@ngx-translate/core";
import { SvgIconComponent } from '../svg-icon/svg-icon.component';

@Component({
  selector: 'app-confirm-sign-modal',
  imports: [
    MatDialogClose,
    MatIcon,
    MatRipple,
    TranslateModule,
    SvgIconComponent
  ],
  templateUrl: './confirm-sign-modal.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmSignModalComponent {
  constructor(
    private matDialogRef: MatDialogRef<ConfirmSignModalComponent>
  ) {
  }

  onAgree() {
    this.matDialogRef.close('agree');
  }
}
