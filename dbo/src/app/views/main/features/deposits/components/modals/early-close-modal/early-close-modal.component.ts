import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-early-close-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, TranslateModule,MatIconModule],
  templateUrl: './early-close-modal.component.html',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class EarlyCloseModalComponent {
  private dialogRef = inject(MatDialogRef<EarlyCloseModalComponent>);

  cancel(): void {
    this.dialogRef.close({ action: 'cancel' });
  }

  confirmClose(): void {
    this.dialogRef.close({ action: 'confirm' });
  }
}