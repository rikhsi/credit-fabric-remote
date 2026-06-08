import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { IconComponent, IconName } from '../icon/icon.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-confirm-dialog',
  imports: [
    IconComponent,
    MatDialogClose,
    TranslateModule
  ],
  templateUrl: './confirm-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmDialogComponent {
  public readonly data = inject<
    { icon: IconName; title: string; description: string; }
  >(MAT_DIALOG_DATA);
  public dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
}
