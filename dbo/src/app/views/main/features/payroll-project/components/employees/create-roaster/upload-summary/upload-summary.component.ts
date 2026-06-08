import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose } from "@angular/material/dialog";

@Component({
  selector: 'app-upload-summary',
  imports: [
    MatDialogClose
  ],
  templateUrl: './upload-summary.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploadSummaryComponent {
  readonly data = inject(MAT_DIALOG_DATA);
}
